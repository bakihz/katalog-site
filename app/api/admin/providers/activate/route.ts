import { getRequestBaseUrl } from "@/lib/requestUrl";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import { isProviderReady } from "@/lib/paymentProviderAdmin";

export async function POST(req: NextRequest) {
  const baseUrl = getRequestBaseUrl(req);
  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));

  if (!Number.isInteger(providerId) || providerId <= 0) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=activate-notfound`,
      { status: 303 },
    );
  }

  const provider = await prisma.paymentProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=activate-notfound`,
      { status: 303 },
    );
  }

  if (!isProviderReady(provider)) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=activate-incomplete`,
      { status: 303 },
    );
  }

  await prisma.$transaction([
    prisma.paymentProvider.updateMany({ data: { isActive: false } }),
    prisma.paymentProvider.update({
      where: { id: provider.id },
      data: { isActive: true },
    }),
  ]);

  await writeAdminAuditLog(req, {
    action: "payment_provider.activate",
    entityType: "payment_provider",
    entityId: provider.id,
    entityName: provider.name,
    details: {
      activatedProviderId: provider.id,
      activatedProviderName: provider.name,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/providers");

  return NextResponse.redirect(`${baseUrl}/admin/providers`, { status: 303 });
}
