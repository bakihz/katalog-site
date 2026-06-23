import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;
    const response = formData.get("Response") as string;
    const procReturnCode = formData.get("ProcReturnCode") as string;
    const transId = formData.get("TransId") as string;
    const mdStatus = formData.get("mdStatus") as string;

    const isSuccess =
      response === "Approved" && procReturnCode === "00" && mdStatus === "1";

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
        return NextResponse.redirect(`/panel/dekont/${payment.id}`);
      }
    }

    return NextResponse.redirect("/panel/odeme?error=1");
  } catch (err) {
    console.error(err);
    return NextResponse.redirect("/panel/odeme?error=1");
  }
}
