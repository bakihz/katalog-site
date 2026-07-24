import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = getRequestBaseUrl(req);
  const formData = await req.formData();
  const password = ((formData.get("password") as string) ?? "").trim();
  const agentId = Number(id);

  if (!Number.isInteger(agentId) || agentId <= 0 || password.length < 8) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=password`, {
      status: 303,
    });
  }

  const agent = await prisma.user.findUnique({ where: { id: agentId } });

  if (!agent) {
    return NextResponse.redirect(`${baseUrl}/admin/agents?error=not-found`, {
      status: 303,
    });
  }

  await prisma.user.update({
    where: { id: agentId },
    data: { password: hashPassword(password) },
  });

  return NextResponse.redirect(`${baseUrl}/admin/agents?success=password`, {
    status: 303,
  });
}
