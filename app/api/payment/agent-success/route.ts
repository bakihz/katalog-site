import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAgentToken } from "@/lib/agentAuth";
import { verifyNestpayResponseHash } from "@/lib/nestpay";

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

function getFailureRedirectUrl(
  baseUrl: string,
  paymentId: number | null | undefined,
  formData: FormData,
) {
  if (!paymentId) return `${baseUrl}/panel/odeme?error=1`;

  const params = new URLSearchParams();
  const err = formData.get("ErrMsg") || formData.get("errmsg");
  const code =
    formData.get("ErrorCode") ||
    formData.get("ProcReturnCode") ||
    formData.get("mdStatus");

  if (typeof err === "string" && err.trim()) {
    params.set("err", err.trim());
  }

  if (typeof code === "string" && code.trim()) {
    params.set("code", code.trim());
  }

  const queryString = params.toString();
  return `${baseUrl}/panel/odeme/basarisiz/${paymentId}${
    queryString ? `?${queryString}` : ""
  }`;
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

  console.info("[AgentPaymentRedirect]", {
    url,
    agentId,
    refreshedAgentSession: Boolean(agentId),
  });

  return redirectResponse;
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  try {
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;
    const response = formData.get("Response") as string;
    const procReturnCode = formData.get("ProcReturnCode") as string;
    const transId = formData.get("TransId") as string;
    const mdStatus = formData.get("mdStatus") as string;
    const baseUrl = getBaseUrl(req);
    const hashCheck = verifyNestpayResponseHash(
      formData,
      process.env.ZIRAAT_STORE_KEY,
    );

    console.info("[AgentPaymentSuccessCallback:received]", {
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

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: isSuccess ? "Paid" : "Failed",
        transactionId: transId || null,
      },
    });

    const payment = await prisma.payment.findFirst({ where: { orderId } });

    console.info("[AgentPaymentSuccessCallback:processed]", {
      orderId,
      paymentId: payment?.id ?? null,
      paymentAgentId: payment?.agentId ?? null,
      isSuccess,
      durationMs: Date.now() - startedAt,
    });

    if (isSuccess) {
      if (payment) {
        return redirectWithAgentSession(
          `${baseUrl}/panel/dekont/${payment.id}`,
          payment.agentId,
        );
      }
    }

    return redirectWithAgentSession(
      getFailureRedirectUrl(baseUrl, payment?.id, formData),
      payment?.agentId ?? null,
    );
  } catch (err) {
    console.error(err);
    const baseUrl = getBaseUrl(req);
    return NextResponse.redirect(`${baseUrl}/panel/odeme?error=1`, {
      status: 303,
    });
  }
}
