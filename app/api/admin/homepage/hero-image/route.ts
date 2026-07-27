import { NextRequest, NextResponse } from "next/server";
import { homepageSectionDefinitions } from "@/lib/homepageSections";
import { prisma } from "@/lib/prisma";
import {
  PublicImageUploadError,
  savePublicImage,
} from "@/lib/publicImageUpload";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const variant = formData.get("variant") === "mobile" ? "mobile" : "desktop";
  const definition = homepageSectionDefinitions.find(
    (section) => section.key === "promoHero",
  );

  if (!definition) {
    return NextResponse.json(
      { error: "Tanıtım alanı tanımı bulunamadı." },
      { status: 500 },
    );
  }

  let imageUrl: string;

  try {
    imageUrl = await savePublicImage(formData.get("image"), {
      directory: "homepage",
      filePrefix: `hero-${variant}`,
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

  await prisma.homepageSection.upsert({
    where: { key: definition.key },
    create: {
      key: definition.key,
      label: definition.label,
      contentTitle: definition.defaultContentTitle,
      contentDescription: definition.defaultContentDescription,
      imageUrl: variant === "desktop" ? imageUrl : null,
      mobileImageUrl: variant === "mobile" ? imageUrl : null,
      buttonLabel: definition.defaultButtonLabel,
      buttonUrl: definition.defaultButtonUrl,
      isVisible: true,
      sortOrder: definition.defaultSortOrder,
    },
    update:
      variant === "mobile"
        ? { mobileImageUrl: imageUrl }
        : { imageUrl },
  });

  return NextResponse.json({ imageUrl, variant });
}
