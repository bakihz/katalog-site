import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { Prisma } from "@prisma/client";
import { normalizeUserRole } from "@/lib/userRole";



export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const name = ((formData.get("name") as string) ?? "").trim();
  const username = ((formData.get("username") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const role = normalizeUserRole(formData.get("role"));
  const baseUrl = getRequestBaseUrl(req);

  if (!name || !username || password.length < 8) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=create`, {
      status: 303,
    });
  }

  const hashed = hashPassword(password);

  try {
    await prisma.user.create({
      data: { name, username, password: hashed, role } as Prisma.UserCreateInput,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.redirect(`${baseUrl}/admin/agents?error=duplicate`, {
        status: 303,
      });
    }

    throw error;
  }

  return NextResponse.redirect(`${baseUrl}/admin/agents?success=created`, {
    status: 303,
  });
}
