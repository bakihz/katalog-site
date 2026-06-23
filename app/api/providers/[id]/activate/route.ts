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
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  const { id } = await context.params;
  const baseUrl = getBaseUrl(req);

  await prisma.paymentProvider.updateMany({
    data: {
      isActive: false,
    },
  });

  await prisma.paymentProvider.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: true,
    },
  });

  return NextResponse.redirect(`${baseUrl}/admin/providers`);
}
