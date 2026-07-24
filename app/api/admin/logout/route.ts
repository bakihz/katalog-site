import { NextRequest, NextResponse } from "next/server";
import { getRequestBaseUrl } from "@/lib/requestUrl";

export async function POST(req: NextRequest) {
  const url = `${getRequestBaseUrl(req)}/admin/login`;

  const response = NextResponse.redirect(url, {
    status: 303,
  });
  response.cookies.delete("admin_session");
  return response;
}
