import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import { isValidHttpUrl, readProviderFormValue } from "@/lib/paymentProviderAdmin";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const formData = await req.formData();

  const name = readProviderFormValue(formData, "name");
  const merchantId = readProviderFormValue(formData, "merchantId");
  const storeKey = readProviderFormValue(formData, "storeKey");
  const gatewayUrl = readProviderFormValue(formData, "gatewayUrl");
  const apiUser = readProviderFormValue(formData, "apiUser");
  const apiPassword = readProviderFormValue(formData, "apiPassword");

  if (!name) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=create-name`,
      { status: 303 },
    );
  }

  const existing = await prisma.paymentProvider.findFirst({ where: { name } });
  if (existing) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=create-duplicate`,
      { status: 303 },
    );
  }

  if (!isValidHttpUrl(gatewayUrl)) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=create-gateway`,
      { status: 303 },
    );
  }

  const provider = await prisma.paymentProvider.create({
    data: {
      name,
      merchantId: merchantId || null,
      storeKey: storeKey || null,
      gatewayUrl: gatewayUrl || null,
      apiUser: apiUser || null,
      apiPassword: apiPassword || null,
      isActive: false,
    },
  });

  await writeAdminAuditLog(req, {
    action: "payment_provider.create",
    entityType: "payment_provider",
    entityId: provider.id,
    entityName: provider.name,
    details: {
      createdFields: {
        name: Boolean(name),
        merchantId: Boolean(merchantId),
        storeKey: Boolean(storeKey),
        gatewayUrl: Boolean(gatewayUrl),
        apiUser: Boolean(apiUser),
        apiPassword: Boolean(apiPassword),
      },
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/providers?success=created`,
    { status: 303 },
  );
}
