import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAgentCookie } from "@/lib/agentAuth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

function getBaseUrl(req: NextRequest): string {
  const requestUrl = new URL(req.url);
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    requestUrl.host;
  const protocol =
    req.headers.get("x-forwarded-proto") ||
    requestUrl.protocol.replace(":", "");
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const cookieStore = await cookies();
  const agentId = await verifyAgentCookie(
    cookieStore.get("agent_session")?.value,
  );

  if (!agentId) {
    return NextResponse.redirect(`${baseUrl}/giris`, { status: 303 });
  }

  const formData = await req.formData();
  const currentPassword = (formData.get("currentPassword") as string) ?? "";
  const newPassword = ((formData.get("newPassword") as string) ?? "").trim();
  const confirmPassword = (
    (formData.get("confirmPassword") as string) ?? ""
  ).trim();

  if (
    !currentPassword ||
    newPassword.length < 8 ||
    newPassword !== confirmPassword
  ) {
    return NextResponse.redirect(
      `${baseUrl}/panel/ayarlar?error=new-password`,
      { status: 303 },
    );
  }

  const agent = await prisma.user.findUnique({ where: { id: agentId } });

  if (
    !agent ||
    !agent.isActive ||
    !verifyPassword(currentPassword, agent.password)
  ) {
    return NextResponse.redirect(`${baseUrl}/panel/ayarlar?error=password`, {
      status: 303,
    });
  }

  await prisma.user.update({
    where: { id: agentId },
    data: { password: hashPassword(newPassword) },
  });

  return NextResponse.redirect(`${baseUrl}/panel/ayarlar?success=password`, {
    status: 303,
  });
}
