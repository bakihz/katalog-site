import { getRequestBaseUrl } from "@/lib/requestUrl";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getChangedFields, writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import {
  PublicImageUploadError,
  savePublicImage,
} from "@/lib/publicImageUpload";
import { defaultSiteSettings } from "@/lib/siteSettings";

export const runtime = "nodejs";

const pageSizes = new Set([12, 24, 36, 48]);

function readText(formData: FormData, name: string, maxLength: number) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}

function readOptionalText(formData: FormData, name: string, maxLength: number) {
  return readText(formData, name, maxLength) || null;
}

function isSafeHttpUrl(value: string | null) {
  if (!value) return true;

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
  const requestedPageSize = Number(formData.get("catalogPageSize"));
  const data = {
    companyName: readText(formData, "companyName", 200),
    primaryPhone: readText(formData, "primaryPhone", 50),
    secondaryPhone: readOptionalText(formData, "secondaryPhone", 50),
    email: readText(formData, "email", 320).toLocaleLowerCase("tr-TR"),
    address: readOptionalText(formData, "address", 500),
    mapsUrl: readOptionalText(formData, "mapsUrl", 1000),
    whatsappPhone: readOptionalText(formData, "whatsappPhone", 50),
    heroBadge: readText(formData, "heroBadge", 120),
    heroTitle: readText(formData, "heroTitle", 160),
    heroHighlight: readText(formData, "heroHighlight", 160),
    heroDescription: readText(formData, "heroDescription", 600),
    showAgentLogin: formData.get("showAgentLogin") === "on",
    catalogPageSize: pageSizes.has(requestedPageSize) ? requestedPageSize : 24,
  };

  if (
    !data.companyName ||
    !data.primaryPhone ||
    !data.email ||
    !data.email.includes("@") ||
    !data.heroBadge ||
    !data.heroTitle ||
    !data.heroHighlight ||
    !data.heroDescription ||
    !isSafeHttpUrl(data.mapsUrl)
  ) {
    return NextResponse.redirect(`${baseUrl}/admin/site-settings?error=validation`, { status: 303 });
  }

  const logoEntry = formData.get("logo");
  let logoUrl: string | undefined;

  if (logoEntry instanceof File && logoEntry.size > 0) {
    try {
      logoUrl = await savePublicImage(logoEntry, {
        directory: "site",
        filePrefix: "logo",
      });
    } catch (error) {
      if (error instanceof PublicImageUploadError) {
        return NextResponse.redirect(
          `${baseUrl}/admin/site-settings?error=logo`,
          { status: 303 },
        );
      }

      throw error;
    }
  }

  const updateData = logoUrl ? { ...data, logoUrl } : data;
  const before = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { ...defaultSiteSettings, ...updateData, id: 1 },
    update: updateData,
  });

  await writeAdminAuditLog(req, {
    action: "site_settings.update",
    entityType: "site_settings",
    entityId: settings.id,
    entityName: settings.companyName,
    details: {
      changedFields: getChangedFields(before ?? {}, updateData),
    },
  });

  revalidatePath("/home");
  revalidatePath("/katalog");
  revalidatePath("/urunler");
  revalidatePath("/gecici");

  return NextResponse.redirect(`${baseUrl}/admin/site-settings?success=updated`, { status: 303 });
}
