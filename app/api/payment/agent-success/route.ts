import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { agentSessionMaxAgeSeconds, createAgentToken } from "@/lib/agentAuth";
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

function getBaseUrl(req: NextRequest): string {
  const requestUrl = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    requestUrl.host;
  const protocol =
    req.headers.get("x-forwarded-proto") ||
    requestUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

async function redirectWithAgentSession(url: string, agentId: number | null) {
  const redirectResponse = NextResponse.redirect(url, { status: 303 });

  if (agentId) {
    const token = await createAgentToken(agentId);
    redirectResponse.cookies.set("agent_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: agentSessionMaxAgeSeconds,
      path: "/",
    });
  }

  logPaymentDebug("[AgentPaymentRedirect]", {
    url,
    agentId,
    refreshedAgentSession: Boolean(agentId),
  });

  return redirectResponse;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const baseUrl = getBaseUrl(req);

  try {
    const decodedRequest = req.clone();
    const formData = await req.formData();
    const decodedFormData =
      await parsePaymentCallbackFormData(decodedRequest);
    const orderId = formData.get("oid") as string;
    const response = formData.get("Response") as string;
    const procReturnCode = formData.get("ProcReturnCode") as string;
    const transId = formData.get("TransId") as string;
    const mdStatus = formData.get("mdStatus") as string;
    const payment = await prisma.payment.findFirst({ where: { orderId } });
    const providerConfig = await getPaymentProviderConfigByName(
      payment?.providerName ?? ZIRAAT_PROVIDER_NAME,
    );
    const hashCheck =
      payment && providerConfig
        ? verifyNestpayResponseHash(formData, providerConfig.storeKey)
        : { ok: false, reason: "provider-not-found" };

    logPaymentDebug("[AgentPaymentSuccessCallback:received]", {
      orderId,
      baseUrl,
      response,
      procReturnCode,
      mdStatus,
      hashValid: hashCheck.ok,
      hashReason: hashCheck.reason,
    });

    if (!hashCheck.ok) {
      console.warn("[AgentPaymentSuccessCallback:hash-failed]", {
        orderId,
        reason: hashCheck.reason,
      });
      return NextResponse.redirect(`${baseUrl}/panel/odeme?error=1`, {
        status: 303,
      });
    }

    const isSuccess =
      response === "Approved" &&
      procReturnCode === "00" &&
      mdStatus === "1";
    const failureDetails = isSuccess
      ? { errorCode: null, errorMessage: null }
      : getPaymentFailureDetails(decodedFormData);

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
        status: isSuccess ? "Paid" : "Failed",
        transactionId: transId || null,
        errorCode: failureDetails.errorCode,
        errorMessage: failureDetails.errorMessage,
      } as unknown as Prisma.PaymentUpdateInput,
    });
    revalidatePath("/panel");
    revalidatePath("/panel/islemler");

    logPaymentDebug("[AgentPaymentSuccessCallback:processed]", {
      orderId,
      paymentId: updatedPayment.id,
      paymentAgentId: updatedPayment.agentId,
      isSuccess,
      durationMs: Date.now() - startedAt,
    });

    if (isSuccess) {
      return redirectWithAgentSession(
        `${baseUrl}/panel/dekont/${updatedPayment.id}`,
        updatedPayment.agentId,
      );
    }

    return redirectWithAgentSession(
      getFailureRedirectUrl({
        baseUrl,
        paymentId: updatedPayment.id,
        formData: decodedFormData,
      }),
      updatedPayment.agentId,
    );
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${baseUrl}/panel/odeme?error=1`, {
      status: 303,
    });
  }
}
