import { getRequestBaseUrl } from "@/lib/requestUrl";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { redirectWithAgentSession } from "@/lib/agentPaymentRedirect";
import { verifyNestpayResponseHash } from "@/lib/nestpay";
import { logPaymentDebug } from "@/lib/paymentDebug";
import {
  getFailureRedirectUrl,
  getPaymentFailureDetails,
  parsePaymentCallbackFormData,
} from "@/lib/paymentFailure";
import {
  getPaymentProviderConfigByName,
  ZIRAAT_PROVIDER_NAME,
} from "@/lib/paymentProviders";
import { isSuccessfulPaymentStatus } from "@/lib/paymentStatus";



export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const baseUrl = getRequestBaseUrl(req);

  try {
    const decodedRequest = req.clone();
    const formData = await req.formData();
    const decodedFormData =
      await parsePaymentCallbackFormData(decodedRequest);
    const orderId = formData.get("oid") as string;
    const payment = await prisma.payment.findFirst({ where: { orderId } });
    const providerConfig = await getPaymentProviderConfigByName(
      payment?.providerName ?? ZIRAAT_PROVIDER_NAME,
    );
    const hashCheck =
      payment && providerConfig
        ? verifyNestpayResponseHash(formData, providerConfig.storeKey)
        : { ok: false, reason: "provider-not-found" };

    logPaymentDebug("[AgentPaymentFailCallback:received]", {
      orderId,
      baseUrl,
      hashValid: hashCheck.ok,
      hashReason: hashCheck.reason,
    });

    if (hashCheck.ok) {
      const failureDetails = getPaymentFailureDetails(decodedFormData);

      if (!payment) {
        return NextResponse.redirect(`${baseUrl}/panel/odeme?error=1`, {
          status: 303,
        });
      }

      if (isSuccessfulPaymentStatus(payment.status)) {
        return redirectWithAgentSession(
          `${baseUrl}/panel/dekont/${payment.id}`,
          payment.agentId,
        );
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "Failed",
          errorCode: failureDetails.errorCode,
          errorMessage: failureDetails.errorMessage,
        } as unknown as Prisma.PaymentUpdateInput,
      });
      revalidatePath("/panel");
      revalidatePath("/panel/islemler");

      logPaymentDebug("[AgentPaymentFailCallback:processed]", {
        orderId,
        paymentId: updatedPayment.id,
        paymentAgentId: updatedPayment.agentId,
        durationMs: Date.now() - startedAt,
      });
      return redirectWithAgentSession(
        getFailureRedirectUrl({
          baseUrl,
          paymentId: updatedPayment.id,
          formData: decodedFormData,
        }),
        updatedPayment.agentId,
      );
    }

    console.warn("[AgentPaymentFailCallback:hash-failed]", {
      orderId,
      reason: hashCheck.reason,
    });
  } catch (err) {
    console.error(err);
  }

  return NextResponse.redirect(`${baseUrl}/panel/odeme?error=1`, {
    status: 303,
  });
}
