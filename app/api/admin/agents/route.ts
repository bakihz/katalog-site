import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = ((formData.get("name") as string) ?? "").trim();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!name || !username || !password) {
    return NextResponse.redirect("/admin/agents?error=1");
  }

  const hashed = hashPassword(password);

  await prisma.user.create({
    data: { name, username, password: hashed },
  });

  return NextResponse.redirect("/admin/agents");
}
