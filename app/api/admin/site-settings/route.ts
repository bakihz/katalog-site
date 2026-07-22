import { NextRequest, NextResponse } from "next/server";
import { getChangedFields, writeAdminAuditLog } from "@/lib/adminAuditLog";
import { prisma } from "@/lib/prisma";
import { defaultSiteSettings } from "@/lib/siteSettings";

const pageSizes = new Set([12, 24, 36, 48]);

function getBaseUrl(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  return `${req.headers.get("x-forwarded-proto") || "http"}://${host}`;
}

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
  const baseUrl = getBaseUrl(req);
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

  const before = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { ...defaultSiteSettings, ...data, id: 1 },
    update: data,
  });

  await writeAdminAuditLog(req, {
    action: "site_settings.update",
    entityType: "site_settings",
    entityId: settings.id,
    entityName: settings.companyName,
    details: {
      changedFields: getChangedFields(before ?? {}, data),
    },
  });

  return NextResponse.redirect(`${baseUrl}/admin/site-settings?success=updated`, { status: 303 });
}
