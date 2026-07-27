import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import {
  PublicImageUploadError,
  savePublicImage,
} from "@/lib/publicImageUpload";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = Number((await params).id);

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { error: "Geçersiz tanıtım kaydı." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const variant = formData.get("variant") === "mobile" ? "mobile" : "desktop";
  let imageUrl: string;

  try {
    imageUrl = await savePublicImage(formData.get("image"), {
      directory: "homepage",
      filePrefix: `hero-${id}-${variant}`,
    });
  } catch (error) {
    if (error instanceof PublicImageUploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    throw error;
  }

  const slide = await prisma.homepageHeroSlide.update({
    where: { id },
    data:
      variant === "mobile"
        ? { mobileImageUrl: imageUrl }
        : { imageUrl },
  });

  await writeAdminAuditLog(request, {
    action: "homepage_hero_slide.image_upload",
    entityType: "homepage_hero_slide",
    entityId: slide.id,
    entityName: slide.title,
    details: { variant },
  });
  revalidatePath("/home");

  return NextResponse.json({ imageUrl, variant });
}
