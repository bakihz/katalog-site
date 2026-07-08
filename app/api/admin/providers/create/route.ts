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

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);
  const formData = await req.formData();

  const name = ((formData.get("name") as string) ?? "").trim();
  const merchantId = ((formData.get("merchantId") as string) ?? "").trim();
  const storeKey = ((formData.get("storeKey") as string) ?? "").trim();
  const gatewayUrl = ((formData.get("gatewayUrl") as string) ?? "").trim();
  const apiUser = ((formData.get("apiUser") as string) ?? "").trim();
  const apiPassword = ((formData.get("apiPassword") as string) ?? "").trim();

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

  await prisma.paymentProvider.create({
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

  return NextResponse.redirect(
    `${baseUrl}/admin/providers?success=created`,
    { status: 303 },
  );
}
