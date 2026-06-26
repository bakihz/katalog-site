import { prisma } from "@/lib/prisma";
import { generateNestpayHash } from "@/lib/nestpay";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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
      ? `${process.env.APP_URL}/api/payment/agent-success`
      : `${process.env.APP_URL}/payment/success`;
    const failUrl = isAgentFlow
      ? `${process.env.APP_URL}/api/payment/agent-fail`
      : `${process.env.APP_URL}/payment/fail`;

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

    console.log("[ENV DEBUG] CLIENT_ID:", JSON.stringify(process.env.ZIRAAT_CLIENT_ID));
    console.log("[ENV DEBUG] STORE_KEY:", JSON.stringify(process.env.ZIRAAT_STORE_KEY));
    console.log("[ENV DEBUG] APP_URL:", JSON.stringify(process.env.APP_URL));
    console.log("[ENV DEBUG] okUrl:", okUrl, "| failUrl:", failUrl);
    console.log("[ENV DEBUG] rnd:", rnd, "| amount:", amount, "| orderId:", orderId);

    const hash = generateNestpayHash({
      clientId: process.env.ZIRAAT_CLIENT_ID!,

      orderId,

      amount,

      okUrl,

      failUrl,

      rnd,

      storeKey: process.env.ZIRAAT_STORE_KEY!,
    });

    return Response.json({
      success: true,

      gatewayUrl: process.env.ZIRAAT_GATEWAY_URL,

      formData: {
        clientid: process.env.ZIRAAT_CLIENT_ID,

        storetype: "3d_pay",

        hash,

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
