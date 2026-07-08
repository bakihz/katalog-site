import { revalidatePath } from "next/cache";
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
  const formData = await req.formData();
  const providerId = Number(formData.get("providerId"));

  if (!Number.isInteger(providerId) || providerId <= 0) {
    return new Response("Geçerli bir sanal POS seçilmedi.", {
      status: 400,
    });
  }

  const provider = await prisma.paymentProvider.findUnique({
    where: {
      id: providerId,
    },
  });

  if (!provider) {
    return new Response("Seçilen sanal POS bulunamadı.", {
      status: 404,
    });
  }

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
        isActive: true,
      },
    }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/admin/providers");

  return NextResponse.redirect(`${getBaseUrl(req)}/admin/providers`, {
    status: 303,
  });
}
