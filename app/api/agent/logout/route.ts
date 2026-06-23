import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const url = `${protocol}://${host}/giris`;

  const response = NextResponse.redirect(url, {
    status: 303,
  });
  response.cookies.delete("agent_session");
  return response;
}
