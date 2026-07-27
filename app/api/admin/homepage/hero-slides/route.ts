import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { parseHomepageHeroSlideInput } from "@/lib/homepageHeroSlides";
import { prisma } from "@/lib/prisma";

function errorResponse(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Tanıtım görseli kaydedilemedi.",
    },
    { status: 400 },
  );
}

export async function POST(request: NextRequest) {
  try {
    const input = parseHomepageHeroSlideInput(await request.json());
    const lastSlide = await prisma.homepageHeroSlide.findFirst({
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
      select: { sortOrder: true },
    });
    const slide = await prisma.homepageHeroSlide.create({
      data: {
        ...input,
        sortOrder: (lastSlide?.sortOrder ?? 0) + 10,
      },
    });

    await writeAdminAuditLog(request, {
      action: "homepage_hero_slide.create",
      entityType: "homepage_hero_slide",
      entityId: slide.id,
      entityName: slide.title,
    });
    revalidatePath("/home");

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as { orderedIds?: unknown };
    const orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.map(Number)
      : [];

    if (
      orderedIds.length === 0 ||
      orderedIds.some((id) => !Number.isInteger(id) || id < 1) ||
      new Set(orderedIds).size !== orderedIds.length
    ) {
      throw new Error("Geçersiz sıralama bilgisi.");
    }

    const storedCount = await prisma.homepageHeroSlide.count({
      where: { id: { in: orderedIds } },
    });

    if (storedCount !== orderedIds.length) {
      throw new Error("Sıralanacak tanıtım kayıtlarından biri bulunamadı.");
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.homepageHeroSlide.update({
          where: { id },
          data: { sortOrder: (index + 1) * 10 },
        }),
      ),
    );

    await writeAdminAuditLog(request, {
      action: "homepage_hero_slides.reorder",
      entityType: "homepage_hero_slides",
      entityName: "Tanıtım görselleri",
      details: { orderedIds },
    });
    revalidatePath("/home");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
