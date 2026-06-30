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
  const baseUrl = getBaseUrl(req);

  try {
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;
    const response = formData.get("Response") as string;
    const procReturnCode = formData.get("ProcReturnCode") as string;
    const transId = formData.get("TransId") as string;
    const mdStatus = formData.get("mdStatus") as string;
    const hashCheck = verifyNestpayResponseHash(
      formData,
      process.env.ZIRAAT_STORE_KEY,
    );

    if (!hashCheck.ok) {
      return NextResponse.redirect(
        `${baseUrl}/odeme/hatali?err=Guvenlik+dogrulamasi+basarisiz`,
        { status: 303 },
      );
    }

    const isSuccess =
      response === "Approved" &&
      procReturnCode === "00" &&
      mdStatus === "1";

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: isSuccess ? "Paid" : "Failed",
        transactionId: transId || null,
      },
    });

    if (isSuccess) {
      const payment = await prisma.payment.findFirst({ where: { orderId } });
      if (payment) {
        return NextResponse.redirect(
          `${baseUrl}/odeme/basarili?id=${payment.id}`,
          { status: 303 },
        );
      }
    }

    return NextResponse.redirect(`${baseUrl}/odeme/hatali`, { status: 303 });
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(`${baseUrl}/odeme/hatali`, { status: 303 });
  }
}
