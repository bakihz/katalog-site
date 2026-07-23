import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const defaultSiteSettings = {
  id: 1,
  companyName: "Lale EDT Gıda A.Ş.",
  primaryPhone: "0 (544) 303 33 66",
  secondaryPhone: "0 (324) 234 10 17",
  email: "info@laleedt.com.tr",
  address: "Yalınayak, 102055 Sok No:2-10, 33240 Toroslar/Mersin",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Lale%20EDT%20G%C4%B1da%2C%20Yal%C4%B1nayak%2C%20102055%20Sok%20No%3A2-10%2C%2033240%20Toroslar%2FMersin",
  whatsappPhone: "905443033366",
  heroBadge: "Ürün & Hizmet Kataloğu",
  heroTitle: "Kaliteli Gıda,",
  heroHighlight: "Güvenilir Tedarik.",
  heroDescription:
    "Tüm ürünlerimize göz atın. Detay ve fiyat bilgisi için temsilcimizle iletişime geçebilirsiniz.",
  showAgentLogin: true,
  catalogPageSize: 24,
} as const;

export type PublicSiteSettings = {
  id: number;
  companyName: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  email: string;
  address: string | null;
  mapsUrl: string | null;
  whatsappPhone: string | null;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  showAgentLogin: boolean;
  catalogPageSize: number;
};

export const getSiteSettings = cache(async function getSiteSettings(): Promise<PublicSiteSettings> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  return settings ?? {
    ...defaultSiteSettings,
    secondaryPhone: defaultSiteSettings.secondaryPhone,
    address: defaultSiteSettings.address,
    mapsUrl: defaultSiteSettings.mapsUrl,
    whatsappPhone: defaultSiteSettings.whatsappPhone,
  };
});

export function getTelephoneHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "#";
  if (digits.startsWith("90")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+90${digits.slice(1)}`;
  return `tel:+90${digits}`;
}
