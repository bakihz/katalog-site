import { prisma } from "@/lib/prisma";

export type HomepageHeroSlideView = {
  id: number | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type HomepageHeroSlideInput = Omit<
  HomepageHeroSlideView,
  "id" | "sortOrder"
>;

function optionalText(value: unknown, maxLength: number) {
  const normalized = String(value ?? "").trim().slice(0, maxLength);
  return normalized || null;
}

export function isSafeHomepageImageUrl(value: string | null) {
  if (!value) return true;
  if (value.startsWith("/uploads/homepage/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function isSafeHomepageLinkUrl(value: string | null) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseHomepageHeroSlideInput(
  value: unknown,
): HomepageHeroSlideInput {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const title = String(input.title ?? "").trim().slice(0, 200);
  const description = optionalText(input.description, 600);
  const imageUrl = optionalText(input.imageUrl, 1000);
  const mobileImageUrl = optionalText(input.mobileImageUrl, 1000);
  const buttonLabel = optionalText(input.buttonLabel, 120);
  const buttonUrl = optionalText(input.buttonUrl, 1000);

  if (!title) {
    throw new Error("Tanıtım başlığı zorunludur.");
  }

  if (
    !isSafeHomepageImageUrl(imageUrl) ||
    !isSafeHomepageImageUrl(mobileImageUrl) ||
    !isSafeHomepageLinkUrl(buttonUrl)
  ) {
    throw new Error("Geçersiz görsel veya buton bağlantısı.");
  }

  return {
    title,
    description,
    imageUrl,
    mobileImageUrl,
    buttonLabel,
    buttonUrl,
    isActive: input.isActive !== false,
  };
}

export async function getHomepageHeroSlides() {
  return prisma.homepageHeroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export function createLegacyHeroSlide(
  section: {
    contentTitle: string | null;
    contentDescription: string | null;
    imageUrl: string | null;
    mobileImageUrl: string | null;
    buttonLabel: string | null;
    buttonUrl: string | null;
  },
  fallbackTitle: string,
): HomepageHeroSlideView {
  return {
    id: null,
    title: section.contentTitle ?? fallbackTitle,
    description: section.contentDescription,
    imageUrl: section.imageUrl,
    mobileImageUrl: section.mobileImageUrl,
    buttonLabel: section.buttonLabel,
    buttonUrl: section.buttonUrl,
    isActive: true,
    sortOrder: 10,
  };
}
