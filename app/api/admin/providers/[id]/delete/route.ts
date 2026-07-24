import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";



export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const baseUrl = getRequestBaseUrl(req);
  const { id } = await params;
  const providerId = Number(id);

  if (!Number.isInteger(providerId) || providerId <= 0) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=delete-notfound`,
      { status: 303 },
    );
  }

  const provider = await prisma.paymentProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=delete-notfound`,
      { status: 303 },
    );
  }

  if (provider.isActive) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=delete-active`,
      { status: 303 },
    );
  }

  await prisma.paymentProvider.delete({ where: { id: providerId } });

  await writeAdminAuditLog(req, {
    action: "payment_provider.delete",
    entityType: "payment_provider",
    entityId: provider.id,
    entityName: provider.name,
    details: {
      deletedProviderName: provider.name,
      wasActive: provider.isActive,
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/providers?success=deleted`,
    { status: 303 },
  );
}
