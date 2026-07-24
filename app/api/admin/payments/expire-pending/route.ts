import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const pendingExpirationHours = 1;

export async function POST(req: NextRequest) {
  const baseUrl = getRequestBaseUrl(req);
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
