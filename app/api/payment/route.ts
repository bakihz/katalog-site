import { prisma } from "@/lib/prisma";
import { generateNestpayHash } from "@/lib/nestpay";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";

function getBaseUrl(req: Request): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const baseUrl = getBaseUrl(req);

    // Identify the agent making the request (if any)
    const cookieStore = await cookies();
    const agentId = await verifyAgentCookie(
      cookieStore.get("agent_session")?.value,
    );

    const provider = await prisma.paymentProvider.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!provider) {
      return Response.json(
        {
          success: false,
          message: "Aktif ödeme sağlayıcı yok",
        },
        {
          status: 400,
        },
      );
    }

    const orderId = Date.now().toString();

    const amount = Number(body.amount).toFixed(2);

    const rnd = Math.random().toString(36).substring(2, 22).padEnd(20, "0");

    // Agent flow uses dedicated success/fail API routes so the bank POST is handled
    const isAgentFlow = agentId !== null;
    const okUrl = isAgentFlow
      ? `${baseUrl}/api/payment/agent-success`
      : `${baseUrl}/payment/success`;
    const failUrl = isAgentFlow
      ? `${baseUrl}/api/payment/agent-fail`
      : `${baseUrl}/payment/fail`;

    await prisma.payment.create({
      data: {
        customerName: body.customerName,

        companyName: body.companyName,

        description: body.description,

        amount: Number(amount),

        status: "Pending",

        providerName: provider.name,

        orderId,

        agentId: agentId ?? undefined,
      },
    });

    // Build form fields first (without hash), then compute hash from them
    const formFields: Record<string, string> = {
      clientid: process.env.ZIRAAT_CLIENT_ID!,
      storetype: "3d_pay",
      hashAlgorithm: "ver3",
      trantype: "Auth",
      islemtipi: "Auth",
      amount,
      currency: "949",
      installment: "",
      oid: orderId,
      okUrl,
      failUrl,
      lang: "tr",
      rnd,
      pan: body.pan ?? "",
      cv2: body.cv2 ?? "",
      Ecom_Payment_Card_ExpDate_Month: body.expMonth ?? "",
      Ecom_Payment_Card_ExpDate_Year: body.expYear ?? "",
    };

    const hash = generateNestpayHash(formFields, process.env.ZIRAAT_STORE_KEY!);

    return Response.json({
      success: true,

      gatewayUrl: process.env.ZIRAAT_GATEWAY_URL,

      formData: {
        ...formFields,
        hash,
      },
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
