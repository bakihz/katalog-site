import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createAgentToken } from "@/lib/agentAuth";
import { verifyNestpayResponseHash } from "@/lib/nestpay";
import { logPaymentDebug } from "@/lib/paymentDebug";
import {
  getFailureRedirectUrl,
  getPaymentFailureDetails,
} from "@/lib/paymentFailure";
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
      maxAge: 60 * 60 * 8,
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
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;
    const hashCheck = verifyNestpayResponseHash(
      formData,
      process.env.ZIRAAT_STORE_KEY,
    );

    logPaymentDebug("[AgentPaymentFailCallback:received]", {
      orderId,
      baseUrl,
      hashValid: hashCheck.ok,
      hashReason: hashCheck.reason,
    });

    if (hashCheck.ok) {
      const failureDetails = getPaymentFailureDetails(formData);
      const payment = await prisma.payment.findFirst({ where: { orderId } });

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
          formData,
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
