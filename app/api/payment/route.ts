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

    const orderId = Date.now().toString();

    const amount = Number(body.amount).toFixed(2);

    const rnd = new Date().toLocaleString("tr-TR");

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
      clientId: process.env.ZIRAAT_CLIENT_ID!,

      orderId,

      amount,

      okUrl,

      failUrl,

      transactionType: "Auth",

      instalment: "",

      rnd,

      currency: "949",

      storeKey: process.env.ZIRAAT_STORE_KEY!,
    });

    return Response.json({
      success: true,

      gatewayUrl: process.env.ZIRAAT_GATEWAY_URL,

      formData: {
        clientid: process.env.ZIRAAT_CLIENT_ID,

        storetype: "3d_pay",

        hash: encodeURIComponent(hash),

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
