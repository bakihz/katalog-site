import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createAgentToken } from "@/lib/agentAuth";
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

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const baseUrl = getBaseUrl(req);
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
    maxAge: 60 * 60 * 8, // 8 saat
    path: "/",
  });

  return response;
}
