import { NextRequest, NextResponse } from "next/server";
import { getRequestBaseUrl } from "@/lib/requestUrl";

export async function POST(req: NextRequest) {
  const url = `${getRequestBaseUrl(req)}/giris`;

  const response = NextResponse.redirect(url, {
    status: 303,
  });
  response.cookies.delete("agent_session");
  return response;
}
