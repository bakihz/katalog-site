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

export async function POST(req: NextRequest) {
  const baseUrl = getBaseUrl(req);

  try {
    const formData = await req.formData();
    const orderId = formData.get("oid") as string;
    const errMsg = formData.get("ErrMsg") as string;
    const response = formData.get("Response") as string;
    const procReturnCode = formData.get("ProcReturnCode") as string;
    const mdStatus = formData.get("mdStatus") as string;

    console.error("[Ziraat FAIL]", { orderId, response, procReturnCode, mdStatus, errMsg });

    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId },
        data: { status: "Failed" },
      });
    }

    const params = new URLSearchParams();
    if (errMsg) params.set("err", errMsg);
    if (mdStatus) params.set("md", mdStatus);
    return NextResponse.redirect(`${baseUrl}/odeme/hatali?${params.toString()}`);
  } catch (err) {
    console.error(err);
  }

  return NextResponse.redirect(`${baseUrl}/odeme/hatali`);
}
