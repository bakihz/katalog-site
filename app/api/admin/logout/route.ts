import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", req.url), {
    status: 303,
  });
  response.cookies.delete("admin_session");
  return response;
}
