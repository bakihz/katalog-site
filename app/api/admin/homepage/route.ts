import { getRequestBaseUrl } from "@/lib/requestUrl";
import { NextRequest, NextResponse } from "next/server";
import { writeAdminAuditLog } from "@/lib/adminAuditLog";
import { homepageSectionDefinitions } from "@/lib/homepageSections";
import { prisma } from "@/lib/prisma";

function readText(formData: FormData, name: string, maxLength: number) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function readOptionalText(formData: FormData, name: string, maxLength: number) {
  return readText(formData, name, maxLength) || null;
}

function isSafeImageUrl(value: string | null) {
  if (!value) return true;
  if (value.startsWith("/uploads/categories/")) return true;
  if (value.startsWith("/uploads/homepage/")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSafeLinkUrl(value: string | null) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const baseUrl = getRequestBaseUrl(req);
  const formData = await req.formData();
  const requestedSections = homepageSectionDefinitions.map((definition) => {
    const requestedOrder = Number(formData.get(`${definition.key}Order`));

    const isPromoHero = definition.key === "promoHero";
    const imageUrl = isPromoHero
      ? readOptionalText(formData, "promoHeroImageUrl", 1000)
      : null;
    const mobileImageUrl = isPromoHero
      ? readOptionalText(formData, "promoHeroMobileImageUrl", 1000)
      : null;
    const buttonUrl = isPromoHero
      ? readOptionalText(formData, "promoHeroButtonUrl", 1000)
      : null;

    return {
      ...definition,
      requestedOrder: Number.isInteger(requestedOrder) ? requestedOrder : 999,
      isVisible: formData.get(`${definition.key}Visible`) === "on",
      contentTitle:
        isPromoHero
          ? readText(formData, "promoHeroTitle", 200) ||
            definition.defaultContentTitle
          : definition.key === "categoryShowcase"
          ? readText(formData, "categoryShowcaseTitle", 200) ||
            definition.defaultContentTitle
          : null,
      contentDescription:
        isPromoHero
          ? readOptionalText(formData, "promoHeroDescription", 600)
          : definition.key === "categoryShowcase"
          ? readOptionalText(formData, "categoryShowcaseDescription", 600)
          : null,
      imageUrl,
      mobileImageUrl,
      buttonLabel: isPromoHero
        ? readOptionalText(formData, "promoHeroButtonLabel", 120)
        : null,
      buttonUrl,
      hasInvalidUrl:
        !isSafeImageUrl(imageUrl) ||
        !isSafeImageUrl(mobileImageUrl) ||
        !isSafeLinkUrl(buttonUrl),
    };
  });
  requestedSections.sort(
    (left, right) =>
      left.requestedOrder - right.requestedOrder ||
      left.defaultSortOrder - right.defaultSortOrder,
  );

  if (requestedSections.some((section) => section.hasInvalidUrl)) {
    return NextResponse.redirect(`${baseUrl}/admin/homepage?error=image-url`, {
      status: 303,
    });
  }

  const eligibleCategories = await prisma.catalogCategory.findMany({
    where: {
      isActive: true,
      products: {
        some: {
          showOnWebsite: true,
          logoIsActive: true,
          OR: [
            { catalogSubcategoryId: null },
            { catalogSubcategory: { isActive: true } },
          ],
        },
      },
    },
    select: { id: true },
  });
  const categoryUpdates = eligibleCategories.map((category) => {
    const requestedCategoryOrder = Number(
      formData.get(`category_${category.id}_order`),
    );
    const imageUrl = readOptionalText(
      formData,
      `category_${category.id}_imageUrl`,
      1000,
    );

    if (!isSafeImageUrl(imageUrl)) {
      return null;
    }

    return prisma.catalogCategory.update({
      where: { id: category.id },
      data: {
        showOnHomepage:
          formData.get(`category_${category.id}_visible`) === "on",
        homepageSortOrder:
          Number.isInteger(requestedCategoryOrder) &&
          requestedCategoryOrder >= 0 &&
          requestedCategoryOrder <= 9999
            ? requestedCategoryOrder
            : 0,
        homepageTitle: readOptionalText(
          formData,
          `category_${category.id}_title`,
          255,
        ),
        homepageDescription: readOptionalText(
          formData,
          `category_${category.id}_description`,
          400,
        ),
        homepageImageUrl: imageUrl,
      },
    });
  });

  if (categoryUpdates.some((update) => update === null)) {
    return NextResponse.redirect(`${baseUrl}/admin/homepage?error=image-url`, {
      status: 303,
    });
  }

  await prisma.$transaction([
    ...requestedSections.map((section, index) =>
      prisma.homepageSection.upsert({
        where: { key: section.key },
        create: {
          key: section.key,
          label: section.label,
          contentTitle: section.contentTitle,
          contentDescription: section.contentDescription,
          imageUrl: section.imageUrl,
          mobileImageUrl: section.mobileImageUrl,
          buttonLabel: section.buttonLabel,
          buttonUrl: section.buttonUrl,
          isVisible: section.isVisible,
          sortOrder: (index + 1) * 10,
        },
        update: {
          label: section.label,
          contentTitle: section.contentTitle,
          contentDescription: section.contentDescription,
          imageUrl: section.imageUrl,
          mobileImageUrl: section.mobileImageUrl,
          buttonLabel: section.buttonLabel,
          buttonUrl: section.buttonUrl,
          isVisible: section.isVisible,
          sortOrder: (index + 1) * 10,
        },
      }),
    ),
    ...(categoryUpdates.filter(
      (update): update is NonNullable<typeof update> => update !== null,
    )),
  ]);

  await writeAdminAuditLog(req, {
    action: "homepage_sections.update",
    entityType: "homepage_sections",
    entityName: "Ana Sayfa",
    details: {
      sections: requestedSections.map((section, index) => ({
        key: section.key,
        isVisible: section.isVisible,
        sortOrder: (index + 1) * 10,
      })),
    },
  });

  return NextResponse.redirect(`${baseUrl}/admin/homepage?success=updated`, {
    status: 303,
  });
}
