import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
} from "@/lib/adminAuth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
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

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = ((formData.get("password") as string) ?? "").trim();
  const baseUrl = getRequestBaseUrl(req);
  const rateLimitKey = `admin-login:${getClientIp(req)}`;
  const rateLimit = isRateLimited(rateLimitKey, adminLoginRateLimit);
  let adminUserId: number | null = null;

  if (rateLimit.limited) {
    return NextResponse.redirect(`${baseUrl}/admin/login?error=rate`, {
      status: 303,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    });
  }

  try {
    const adminUser = await prisma.user.findFirst({
      where: { username, role: "admin" },
    });
    const envAdminMatches =
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD;

    if (adminUser) {
      const isValidDbAdmin =
        adminUser.isActive && verifyPassword(password, adminUser.password);

      if (!isValidDbAdmin) {
        recordFailedAttempt(rateLimitKey, adminLoginRateLimit);
        return NextResponse.redirect(`${baseUrl}/admin/login?error=1`, {
          status: 303,
        });
      }

      adminUserId = adminUser.id;
    } else if (envAdminMatches) {
      const existingUser = await prisma.user.findUnique({ where: { username } });

      if (existingUser && existingUser.role !== "admin") {
        recordFailedAttempt(rateLimitKey, adminLoginRateLimit);
        return NextResponse.redirect(`${baseUrl}/admin/login?error=1`, {
          status: 303,
        });
      }

      if (existingUser) {
        const updatedAdmin = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashPassword(password),
            role: "admin",
            isActive: true,
          },
        });
        adminUserId = updatedAdmin.id;
      } else {
        const createdAdmin = await prisma.user.create({
          data: {
            name: "Yönetici",
            username,
            password: hashPassword(password),
            role: "admin",
            isActive: true,
          },
        });
        adminUserId = createdAdmin.id;
      }
    } else {
      recordFailedAttempt(rateLimitKey, adminLoginRateLimit);
      return NextResponse.redirect(`${baseUrl}/admin/login?error=1`, {
        status: 303,
      });
    }
  } catch (error) {
    console.error("[AdminLoginDbError]", error);
    return NextResponse.redirect(`${baseUrl}/admin/login?error=db`, {
      status: 303,
    });
  }

  resetRateLimit(rateLimitKey);
  const token = await createAdminSessionToken(
    adminSessionMaxAgeSeconds,
    adminUserId,
  );
  const response = NextResponse.redirect(`${baseUrl}/admin`, {
    status: 303,
  });

  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: adminSessionMaxAgeSeconds,
    path: "/",
  });

  return response;
}
