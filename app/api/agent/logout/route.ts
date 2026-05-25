import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const response = NextResponse.redirect(new URL("/giris", req.url), {
    status: 303,
  });
  response.cookies.delete("agent_session");
  return response;
}
