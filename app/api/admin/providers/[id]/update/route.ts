import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { getChangedFields, writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import {
  isProviderReady,
  isValidHttpUrl,
  readProviderFormValue,
} from "@/lib/paymentProviderAdmin";



export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const baseUrl = getRequestBaseUrl(req);
  const { id } = await params;
  const providerId = Number(id);

  if (!Number.isInteger(providerId) || providerId <= 0) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-notfound`,
      { status: 303 },
    );
  }

  const formData = await req.formData();
  const name = readProviderFormValue(formData, "name");
  const merchantId = readProviderFormValue(formData, "merchantId");
  const storeKey = readProviderFormValue(formData, "storeKey");
  const gatewayUrl = readProviderFormValue(formData, "gatewayUrl");
  const apiUser = readProviderFormValue(formData, "apiUser");
  const apiPassword = readProviderFormValue(formData, "apiPassword");

  if (!name) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-name`,
      { status: 303 },
    );
  }

  const provider = await prisma.paymentProvider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-notfound`,
      { status: 303 },
    );
  }

  const duplicate = await prisma.paymentProvider.findFirst({
    where: {
      name,
      NOT: { id: providerId },
    },
  });

  if (duplicate) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-duplicate`,
      { status: 303 },
    );
  }

  if (!isValidHttpUrl(gatewayUrl)) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-gateway`,
      { status: 303 },
    );
  }

  const nextProvider = {
    name,
    merchantId: merchantId || null,
    storeKey: storeKey || provider.storeKey,
    gatewayUrl: gatewayUrl || null,
  };

  if (provider.isActive && !isProviderReady(nextProvider)) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-active-incomplete`,
      { status: 303 },
    );
  }

  const beforeAudit = {
    name: provider.name,
    merchantId: provider.merchantId,
    gatewayUrl: provider.gatewayUrl,
    apiUser: provider.apiUser,
  };
  const afterAudit = {
    name,
    merchantId: merchantId || null,
    gatewayUrl: gatewayUrl || null,
    apiUser: apiUser || null,
  };

  const updatedProvider = await prisma.paymentProvider.update({
    where: { id: providerId },
    data: {
      name,
      merchantId: merchantId || null,
      ...(storeKey ? { storeKey } : {}),
      gatewayUrl: gatewayUrl || null,
      apiUser: apiUser || null,
      ...(apiPassword ? { apiPassword } : {}),
    },
  });

  await writeAdminAuditLog(req, {
    action: "payment_provider.update",
    entityType: "payment_provider",
    entityId: updatedProvider.id,
    entityName: updatedProvider.name,
    details: {
      changedFields: getChangedFields(beforeAudit, afterAudit),
      sensitiveFieldsChanged: {
        storeKey: Boolean(storeKey),
        apiPassword: Boolean(apiPassword),
      },
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/providers?success=updated`,
    { status: 303 },
  );
}
