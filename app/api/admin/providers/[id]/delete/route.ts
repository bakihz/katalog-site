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

  return NextResponse.redirect(
    `${baseUrl}/admin/providers?success=deleted`,
    { status: 303 },
  );
}
