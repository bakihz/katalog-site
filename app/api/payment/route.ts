import { prisma } from "@/lib/prisma";
import { generateNestpayHash } from "@/lib/nestpay";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { logPaymentDebug } from "@/lib/paymentDebug";
import { validatePaymentInput } from "@/lib/paymentValidation";

function getBaseUrl(req: Request): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: Request) {
  const startedAt = Date.now();

  try {
    const body = await req.json();
    const baseUrl = getBaseUrl(req);

    // Identify the agent making the request (if any)
    const cookieStore = await cookies();
    const agentCookie = cookieStore.get("agent_session")?.value;
    const agentId = await verifyAgentCookie(agentCookie);

    if (!agentId) {
      return Response.json(
        {
          success: false,
          message: "Ödeme almak için temsilci girişi yapmalısınız.",
        },
        { status: 401 },
      );
    }

    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { isActive: true },
    });

    if (!agent?.isActive) {
      return Response.json(
        {
          success: false,
          message: "Temsilci hesabınız aktif değil.",
        },
        { status: 403 },
      );
    }

    const validation = validatePaymentInput(body);

    if (!validation.ok) {
      return Response.json(
        {
          success: false,
          message: validation.message,
        },
        { status: 400 },
      );
    }

    const paymentInput = validation.data;

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

    const amount = paymentInput.amount;

    const rnd = Math.random().toString(36).substring(2, 22).padEnd(20, "0");

    // Agent flow uses dedicated success/fail API routes so the bank POST is handled
    const okUrl = `${baseUrl}/api/payment/agent-success`;
    const failUrl = `${baseUrl}/api/payment/agent-fail`;

    logPaymentDebug("[PaymentStart]", {
      orderId,
      baseUrl,
      isAgentFlow: true,
      agentId,
      hasAgentCookie: Boolean(agentCookie),
      amount,
      providerName: provider.name,
      okUrl,
      failUrl,
    });

    await prisma.payment.create({
      data: {
        customerName: paymentInput.customerName,

        companyName: paymentInput.companyName,

        description: paymentInput.description,

        amount: paymentInput.amountNumber,

        status: "Pending",

        providerName: provider.name,

        orderId,

        agentId,
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
      pan: paymentInput.pan,
      cv2: paymentInput.cv2,
      Ecom_Payment_Card_ExpDate_Month: paymentInput.expMonth,
      Ecom_Payment_Card_ExpDate_Year: paymentInput.expYear,
    };

    const hash = generateNestpayHash(formFields, process.env.ZIRAAT_STORE_KEY!);

    logPaymentDebug("[PaymentStart:ready]", {
      orderId,
      isAgentFlow: true,
      agentId,
      durationMs: Date.now() - startedAt,
    });

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
