import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isProviderReady } from "@/lib/paymentProviderAdmin";

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
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const baseUrl = getBaseUrl(req);
  const { id } = await context.params;
  const providerId = Number(id);

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

  revalidatePath("/admin");
  revalidatePath("/admin/providers");

  return NextResponse.redirect(`${baseUrl}/admin/providers`, { status: 303 });
}
