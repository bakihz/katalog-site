import { getRequestBaseUrl } from "@/lib/requestUrl";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSessionUserId,
  verifyAdminSessionToken,
} from "@/lib/adminAuth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const baseUrl = getRequestBaseUrl(req);
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session")?.value;
  const adminUserId = await getAdminSessionUserId(adminSession);

  if (!(await verifyAdminSessionToken(adminSession))) {
    return NextResponse.redirect(`${baseUrl}/admin/login`, { status: 303 });
  }

  const formData = await req.formData();
  const currentPassword = (formData.get("currentPassword") as string) ?? "";
  const newPassword = ((formData.get("newPassword") as string) ?? "").trim();
  const confirmPassword = (
    (formData.get("confirmPassword") as string) ?? ""
  ).trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.redirect(`${baseUrl}/admin/settings?error=missing`, {
      status: 303,
    });
  }

  if (newPassword.length < 10 || newPassword !== confirmPassword) {
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?error=new-password`,
      { status: 303 },
    );
  }

  const envAdminUsername = process.env.ADMIN_USERNAME;
  const admin = adminUserId
    ? await prisma.user.findFirst({
        where: { id: adminUserId, role: "admin" },
      })
    : envAdminUsername
      ? await prisma.user.findFirst({
          where: { username: envAdminUsername, role: "admin" },
        })
      : null;

  if (
    !admin ||
    !admin.isActive ||
    !verifyPassword(currentPassword, admin.password)
  ) {
    return NextResponse.redirect(`${baseUrl}/admin/settings?error=password`, {
      status: 303,
    });
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: { password: hashPassword(newPassword) },
  });

  const response = NextResponse.redirect(
    `${baseUrl}/admin/login?success=password`,
    { status: 303 },
  );
  response.cookies.delete("admin_session");
  return response;
}
