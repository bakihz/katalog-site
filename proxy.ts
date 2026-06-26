import { NextRequest, NextResponse } from "next/server";
import { getExpectedSessionToken } from "@/lib/adminAuth";
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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isAdminRoute(pathname) && !isPublicAdminRoute(pathname)) {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const expectedToken = await getExpectedSessionToken();

    if (sessionCookie !== expectedToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      const res = NextResponse.redirect(url);
      res.cookies.delete("admin_session");
      return res;
    }
  }

  if (pathname.startsWith("/panel")) {
    const agentId = await verifyAgentCookie(
      request.cookies.get("agent_session")?.value,
    );

    if (!agentId) {
      const url = request.nextUrl.clone();
      url.pathname = "/giris";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
