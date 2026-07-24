import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNestpayResponseHash } from "@/lib/nestpay";
import {
  getPaymentFailureDetails,
  parsePaymentCallbackFormData,
} from "@/lib/paymentFailure";
import {
  getPaymentProviderConfigByName,
  ZIRAAT_PROVIDER_NAME,
} from "@/lib/paymentProviders";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);

  try {
    const decodedRequest = req.clone();
    const formData = await req.formData();
    const decodedFormData =
      await parsePaymentCallbackFormData(decodedRequest);
    const orderId = formData.get("oid") as string;
    const { errorMessage: errMsg } =
      getPaymentFailureDetails(decodedFormData);
    const response = formData.get("Response") as string;
    const procReturnCode = formData.get("ProcReturnCode") as string;
    const mdStatus = formData.get("mdStatus") as string;
    const payment = await prisma.payment.findFirst({ where: { orderId } });
    const providerConfig = await getPaymentProviderConfigByName(
      payment?.providerName ?? ZIRAAT_PROVIDER_NAME,
    );
    const hashCheck =
      payment && providerConfig
        ? verifyNestpayResponseHash(formData, providerConfig.storeKey)
        : { ok: false };

    console.error("[Ziraat FAIL]", {
      orderId,
      response,
      procReturnCode,
      mdStatus,
      errMsg,
      hashValid: hashCheck.ok,
    });

    if (orderId && hashCheck.ok) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: "Failed" },
      });
    }

    const params = new URLSearchParams();
    if (errMsg) params.set("err", errMsg);
    if (mdStatus) params.set("md", mdStatus);
    return NextResponse.redirect(
      `${baseUrl}/odeme/hatali?${params.toString()}`,
      { status: 303 },
    );
  } catch (err) {
    console.error(err);
  }

  return NextResponse.redirect(`${baseUrl}/odeme/hatali`, { status: 303 });
}
