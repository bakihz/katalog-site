import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;

    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "Failed" },
    });
  } catch (err) {
    console.error(err);
  }

  return NextResponse.redirect(new URL("/panel/odeme?error=1", req.url));
}
