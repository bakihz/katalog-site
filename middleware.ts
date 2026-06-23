import { NextRequest, NextResponse } from "next/server";
import { getExpectedSessionToken } from "@/lib/adminAuth";
import { verifyAgentCookie } from "@/lib/agentAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Forward the current pathname as a header so server layouts can read it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // --- Admin protection ---
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
    pathname !== "/admin/login" &&
    pathname !== "/api/admin/login"
  ) {
    const sessionCookie = request.cookies.get("admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect("/admin/login");
    }

    const expectedToken = await getExpectedSessionToken();

    if (sessionCookie !== expectedToken) {
      const res = NextResponse.redirect("/admin/login");
      res.cookies.delete("admin_session");
      return res;
    }
  }

  // --- Agent panel protection ---
  if (pathname.startsWith("/panel")) {
    const agentId = await verifyAgentCookie(
      request.cookies.get("agent_session")?.value,
    );

    if (!agentId) {
      return NextResponse.redirect("/giris");
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
