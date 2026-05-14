import { prisma } from "@/lib/prisma";
import { generateOrderId } from "@/lib/generateOrderId";
import { generateNestpayHash } from "@/lib/nestpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();

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

    const orderId = generateOrderId();

    const amount = Number(body.amount).toFixed(2);

    const rnd = Date.now().toString();

    const okUrl = `${process.env.APP_URL}/payment/success`;

    const failUrl = `${process.env.APP_URL}/payment/fail`;

    const callbackUrl = `${process.env.APP_URL}/api/payment/callback`;

    await prisma.payment.create({
      data: {
        customerName: body.customerName,

        companyName: body.companyName,

        description: body.description,

        amount: Number(amount),

        status: "Pending",

        providerName: provider.name,

        orderId,
      },
    });

    const hash = generateNestpayHash({
      clientId: process.env.HALKBANK_CLIENT_ID!,

      orderId,

      amount,

      okUrl,

      failUrl,

      callbackUrl,

      transactionType: "Auth",

      instalment: "",

      rnd,

      storeKey: process.env.HALKBANK_STORE_KEY!,
    });

    return Response.json({
      success: true,

      gatewayUrl: process.env.HALKBANK_GATEWAY_URL,

      formData: {
        clientid: process.env.HALKBANK_CLIENT_ID,

        storetype: "3d_pay_hosting",

        hash,

        islemtipi: "Auth",

        amount,

        currency: "949",

        oid: orderId,

        okUrl,

        failUrl,

        callbackUrl,

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
