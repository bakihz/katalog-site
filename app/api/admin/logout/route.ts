import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect("/admin/login", {
    status: 303,
  });
  response.cookies.delete("admin_session");
  return response;
}
