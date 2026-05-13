import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const auth = request.headers.get("authorization");

    if (!auth) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Secure Area"',
        },
      });
    }

    const base64Credentials = auth.split(" ")[1];

    const credentials = atob(base64Credentials);

    const [username, password] = credentials.split(":");

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return new NextResponse("Access denied", {
        status: 401,
      });
    }
  }

  return NextResponse.next();
}
