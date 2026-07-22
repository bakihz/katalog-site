import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PublicImageUploadError,
  savePublicImage,
} from "@/lib/publicImageUpload";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const categoryId = Number((await params).id);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
  }

  const category = await prisma.catalogCategory.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Kategori bulunamadı." }, { status: 404 });
  }

  const formData = await req.formData();
  let imageUrl: string;

  try {
    imageUrl = await savePublicImage(formData.get("image"), {
      directory: "categories",
      filePrefix: `category-${categoryId}`,
    });
  } catch (error) {
    if (error instanceof PublicImageUploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    throw error;
  }

  await prisma.catalogCategory.update({
    where: { id: categoryId },
    data: { homepageImageUrl: imageUrl },
  });

  return NextResponse.json({ imageUrl });
}
