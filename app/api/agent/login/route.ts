import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createAgentToken } from "@/lib/agentAuth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.isActive || !verifyPassword(password, user.password)) {
    return NextResponse.redirect("/giris?error=1", {
      status: 303,
    });
  }

  const token = await createAgentToken(user.id);
  const response = NextResponse.redirect("/panel", {
    status: 303,
  });

  response.cookies.set("agent_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 saat
    path: "/",
  });

  return response;
}
