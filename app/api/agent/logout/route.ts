import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect("/giris", {
    status: 303,
  });
  response.cookies.delete("agent_session");
  return response;
}
