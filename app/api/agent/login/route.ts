import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { agentSessionMaxAgeSeconds, createAgentToken } from "@/lib/agentAuth";
import {
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rateLimit";

const agentLoginRateLimit = {
  limit: 10,
  windowMs: 15 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const baseUrl = getRequestBaseUrl(req);
  const rateLimitKey = `agent-login:${getClientIp(req)}:${username.toLowerCase()}`;
  const rateLimit = isRateLimited(rateLimitKey, agentLoginRateLimit);

  if (rateLimit.limited) {
    return NextResponse.redirect(`${baseUrl}/giris?error=rate`, {
      status: 303,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.isActive || !verifyPassword(password, user.password)) {
    recordFailedAttempt(rateLimitKey, agentLoginRateLimit);
    return NextResponse.redirect(`${baseUrl}/giris?error=1`, {
      status: 303,
    });
  }

  resetRateLimit(rateLimitKey);
  const token = await createAgentToken(user.id);
  const response = NextResponse.redirect(`${baseUrl}/panel`, {
    status: 303,
  });

  response.cookies.set("agent_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: agentSessionMaxAgeSeconds,
    path: "/",
  });

  return response;
}
