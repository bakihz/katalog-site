import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ziraatProviderName = "Ziraat Test POS";

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

  await prisma.paymentProvider.updateMany({
    data: {
      isActive: false,
    },
  });

  const existingProvider = await prisma.paymentProvider.findFirst({
    where: {
      name: ziraatProviderName,
    },
  });

  if (existingProvider) {
    await prisma.paymentProvider.update({
      where: {
        id: existingProvider.id,
      },
      data: {
        isActive: true,
      },
    });
  } else {
    await prisma.paymentProvider.create({
      data: {
        name: ziraatProviderName,
        isActive: true,
      },
    });
  }

  return NextResponse.redirect(`${baseUrl}/admin/providers`);
}
