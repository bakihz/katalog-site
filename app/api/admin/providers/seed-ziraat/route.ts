import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ensureZiraatPaymentProvider,
  ZIRAAT_PROVIDER_NAME,
} from "@/lib/paymentProviders";



export async function POST(req: NextRequest) {
  const baseUrl = getRequestBaseUrl(req);
  const provider = await ensureZiraatPaymentProvider();

  await prisma.$transaction([
    prisma.paymentProvider.updateMany({
      data: {
        isActive: false,
      },
    }),
    prisma.paymentProvider.update({
      where: {
        id: provider.id,
      },
      data: {
        name: ZIRAAT_PROVIDER_NAME,
        isActive: true,
      },
    }),
  ]);

  return NextResponse.redirect(`${baseUrl}/admin/providers`);
}
