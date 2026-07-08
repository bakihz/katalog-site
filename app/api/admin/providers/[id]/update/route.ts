import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const baseUrl = getBaseUrl(req);
  const { id } = await params;
  const providerId = Number(id);

  if (!Number.isInteger(providerId) || providerId <= 0) {
    return NextResponse.redirect(
      `${baseUrl}/admin/providers?error=update-notfound`,
      { status: 303 },
    );
  }

  const formData = await req.formData();
  const name = ((formData.get("name") as string) ?? "").trim();
  const merchantId = ((formData.get("merchantId") as string) ?? "").trim();
  const storeKey = ((formData.get("storeKey") as string) ?? "").trim();
  const gatewayUrl = ((formData.get("gatewayUrl") as string) ?? "").trim();
  const apiUser = ((formData.get("apiUser") as string) ?? "").trim();
  const apiPassword = ((formData.get("apiPassword") as string) ?? "").trim();

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

  await prisma.paymentProvider.update({
    where: { id: providerId },
    data: {
      name,
      merchantId: merchantId || null,
      storeKey: storeKey || null,
      gatewayUrl: gatewayUrl || null,
      apiUser: apiUser || null,
      ...(apiPassword ? { apiPassword } : {}),
    },
  });

  return NextResponse.redirect(
    `${baseUrl}/admin/providers?success=updated`,
    { status: 303 },
  );
}
