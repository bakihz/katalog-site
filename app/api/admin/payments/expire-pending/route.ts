import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const pendingExpirationHours = 1;

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
  const expiredBefore = new Date(
    Date.now() - pendingExpirationHours * 60 * 60 * 1000,
  );

  await prisma.payment.updateMany({
    where: {
      status: "Pending",
      createdAt: {
        lt: expiredBefore,
      },
    },
    data: {
      status: "Expired",
    },
  });

  return NextResponse.redirect(`${baseUrl}/admin/payments`, { status: 303 });
}
