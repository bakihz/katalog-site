import { NextResponse } from "next/server";
import { agentSessionMaxAgeSeconds, createAgentToken } from "@/lib/agentAuth";
import { logPaymentDebug } from "@/lib/paymentDebug";

export async function redirectWithAgentSession(
  url: string,
  agentId: number | null,
) {
  const response = NextResponse.redirect(url, { status: 303 });

  if (agentId) {
    const token = await createAgentToken(agentId);
    response.cookies.set("agent_session", token, {
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

  return response;
}
