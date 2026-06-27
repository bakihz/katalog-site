import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyNestpayResponseHash } from "@/lib/nestpay";

function getBaseUrl(req: NextRequest): string {
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  return `${protocol}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;
    const hashCheck = verifyNestpayResponseHash(
      formData,
      process.env.ZIRAAT_STORE_KEY,
    );

    if (hashCheck.ok) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: "Failed" },
      });
    }
  } catch (err) {
    console.error(err);
  }

  const baseUrl = getBaseUrl(req);
  return NextResponse.redirect(`${baseUrl}/panel/odeme?error=1`);
}
