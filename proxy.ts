import { NextRequest, NextResponse } from "next/server";
import {
  adminSessionMaxAgeSeconds,
  createAdminSessionToken,
  getAdminSessionUserId,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import { verifyAgentCookie } from "@/lib/agentAuth";

function isAdminRoute(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname === "/api/products/import" ||
    pathname.startsWith("/api/providers/")
  );
}

function isPublicAdminRoute(pathname: string) {
  return pathname === "/admin/login" || pathname === "/api/admin/login";
}

function shouldRefreshAdminSession(request: NextRequest) {
  return (
    request.headers.get("next-router-prefetch") !== "1" &&
    request.headers.get("purpose") !== "prefetch"
  );
}

async function canAccessHomepagePreview(request: NextRequest) {
  const adminSession = request.cookies.get("admin_session")?.value;
  return adminSession ? verifyAdminSessionToken(adminSession) : false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "POST" && request.headers.has("next-action")) {
    const url = request.nextUrl.clone();
    return NextResponse.redirect(url, { status: 303 });
  }

  if (
    pathname === "/home" &&
    process.env.PUBLIC_HOMEPAGE_ENABLED !== "true" &&
    !(await canAccessHomepagePreview(request))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/gecici";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isAdminRoute(pathname) && !isPublicAdminRoute(pathname)) {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const isValidAdminSession = await verifyAdminSessionToken(sessionCookie);

    if (!isValidAdminSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      const res = NextResponse.redirect(url);
      res.cookies.delete("admin_session");
      return res;
    }

    const response = NextResponse.next({ request: { headers: requestHeaders } });

    if (shouldRefreshAdminSession(request)) {
      const userId = await getAdminSessionUserId(sessionCookie);
      const refreshedToken = await createAdminSessionToken(
        adminSessionMaxAgeSeconds,
        userId,
      );

      response.cookies.set("admin_session", refreshedToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: adminSessionMaxAgeSeconds,
        path: "/",
      });
    }

    return response;
  }

  if (pathname.startsWith("/panel")) {
    const agentCookie = request.cookies.get("agent_session")?.value;
    const agentId = await verifyAgentCookie(agentCookie);

    if (!agentId) {
      const url = request.nextUrl.clone();
      url.pathname = "/giris";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
