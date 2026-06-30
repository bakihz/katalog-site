import { NextRequest, NextResponse } from "next/server";
import { getExpectedSessionToken } from "@/lib/adminAuth";
import {
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rateLimit";

const adminLoginRateLimit = {
  limit: 5,
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
  const password = ((formData.get("password") as string) ?? "").trim();
  const baseUrl = getBaseUrl(req);
  const rateLimitKey = `admin-login:${getClientIp(req)}`;
  const rateLimit = isRateLimited(rateLimitKey, adminLoginRateLimit);

  if (rateLimit.limited) {
    return NextResponse.redirect(`${baseUrl}/admin/login?error=rate`, {
      status: 303,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    recordFailedAttempt(rateLimitKey, adminLoginRateLimit);
    return NextResponse.redirect(`${baseUrl}/admin/login?error=1`, {
      status: 303,
    });
  }

  resetRateLimit(rateLimitKey);
  const token = await getExpectedSessionToken();
  const response = NextResponse.redirect(`${baseUrl}/admin`, {
    status: 303,
  });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
