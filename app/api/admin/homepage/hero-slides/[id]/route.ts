import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { parseHomepageHeroSlideInput } from "@/lib/homepageHeroSlides";
import { prisma } from "@/lib/prisma";

function readSlideId(value: string) {
  const id = Number(value);

  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Geçersiz tanıtım kaydı.");
  }

  return id;
}

function errorResponse(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Tanıtım görseli güncellenemedi.",
    },
    { status: 400 },
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = readSlideId((await params).id);
    const input = parseHomepageHeroSlideInput(await request.json());
    const slide = await prisma.homepageHeroSlide.update({
      where: { id },
      data: input,
    });

    await writeAdminAuditLog(request, {
      action: "homepage_hero_slide.update",
      entityType: "homepage_hero_slide",
      entityId: slide.id,
      entityName: slide.title,
    });
    revalidatePath("/home");

    return NextResponse.json({ slide });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = readSlideId((await params).id);
    const slideCount = await prisma.homepageHeroSlide.count();

    if (slideCount <= 1) {
      throw new Error("Tanıtım alanında en az bir kayıt bulunmalıdır.");
    }

    const slide = await prisma.homepageHeroSlide.delete({ where: { id } });

    await writeAdminAuditLog(request, {
      action: "homepage_hero_slide.delete",
      entityType: "homepage_hero_slide",
      entityId: slide.id,
      entityName: slide.title,
    });
    revalidatePath("/home");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
