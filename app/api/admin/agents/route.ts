import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = ((formData.get("name") as string) ?? "").trim();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const baseUrl = getBaseUrl(req);

  if (!name || !username || !password) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=1`);
  }

  const hashed = hashPassword(password);

  await prisma.user.create({
    data: { name, username, password: hashed },
  });

  return NextResponse.redirect(`${baseUrl}/admin/agents`);
}
