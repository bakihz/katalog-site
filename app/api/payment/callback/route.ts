import { prisma } from "@/lib/prisma";
import { verifyNestpayResponseHash } from "@/lib/nestpay";
import {
  getPaymentProviderConfigByName,
  ZIRAAT_PROVIDER_NAME,
} from "@/lib/paymentProviders";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const orderId = formData.get("oid") as string;

    const response = formData.get("Response") as string;

    const procReturnCode = formData.get("ProcReturnCode") as string;

    const transId = formData.get("TransId") as string;

    const mdStatus = formData.get("mdStatus") as string;
    const payment = await prisma.payment.findFirst({ where: { orderId } });
    const providerConfig = await getPaymentProviderConfigByName(
      payment?.providerName ?? ZIRAAT_PROVIDER_NAME,
    );

    if (!payment || !providerConfig) {
      return new Response("UNKNOWN PROVIDER", {
        status: 400,
      });
    }

    const hashCheck = verifyNestpayResponseHash(formData, providerConfig.storeKey);

    if (!hashCheck.ok) {
      return new Response("INVALID HASH", {
        status: 400,
      });
    }

    const isSuccess =
      response === "Approved" &&
      procReturnCode === "00" &&
      mdStatus === "1";

    await prisma.payment.updateMany({
      where: {
        orderId,
      },

      data: {
        status: isSuccess ? "Paid" : "Failed",

        transactionId: transId,
      },
    });

    return new Response("OK");
  } catch (error) {
    console.error(error);

    return new Response("ERROR", {
      status: 500,
    });
  }
}
