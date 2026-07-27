import { prisma } from "@/lib/prisma";

export const homepageSectionDefinitions = [
  {
    key: "promoHero",
    label: "Tanıtım Görseli",
    description:
      "Sayfanın en üstünde, menünün arkasında görünen büyük tanıtım alanı.",
    defaultSortOrder: 5,
    defaultContentTitle: "Profesyonel mutfakların güvenilir tedarikçisi.",
    defaultContentDescription:
      "Gıda, pastacılık ve endüstriyel mutfak ihtiyaçlarınız için ürün gruplarımızı keşfedin.",
    defaultImageUrl: null,
    defaultMobileImageUrl: null,
    defaultButtonLabel: "Ürünleri Keşfet",
    defaultButtonUrl: "/katalog",
  },
  {
    key: "hero",
    label: "Karşılama Alanı",
    description: "Ana başlık, vurgulu metin ve katalog tanıtım açıklaması.",
    defaultSortOrder: 10,
    defaultContentTitle: null,
    defaultContentDescription: null,
    defaultImageUrl: null,
    defaultMobileImageUrl: null,
    defaultButtonLabel: null,
    defaultButtonUrl: null,
  },
  {
    key: "categoryShowcase",
    label: "Kategori Vitrini",
    description: "Öne çıkarılan kategorileri büyük görsel kartlarla sunar.",
    defaultSortOrder: 20,
    defaultContentTitle: "Kategorileri Keşfedin",
    defaultContentDescription:
      "İhtiyacınıza uygun ürün gruplarını inceleyerek aradığınız ürünlere daha hızlı ulaşın.",
    defaultImageUrl: null,
    defaultMobileImageUrl: null,
    defaultButtonLabel: null,
    defaultButtonUrl: null,
  },
  {
    key: "catalog",
    label: "Ürün Kataloğu",
    description: "Arama, kategori filtreleri ve yayınlanan ürünlerin listesi.",
    defaultSortOrder: 30,
    defaultContentTitle: null,
    defaultContentDescription: null,
    defaultImageUrl: null,
    defaultMobileImageUrl: null,
    defaultButtonLabel: null,
    defaultButtonUrl: null,
  },
] as const;

export type HomepageSectionKey =
  (typeof homepageSectionDefinitions)[number]["key"];

export type HomepageSectionView = {
  key: HomepageSectionKey;
  label: string;
  description: string;
  isVisible: boolean;
  sortOrder: number;
  contentTitle: string | null;
  contentDescription: string | null;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  buttonLabel: string | null;
  buttonUrl: string | null;
};

export async function getHomepageSections(): Promise<HomepageSectionView[]> {
  const storedSections = await prisma.homepageSection.findMany({
    where: {
      key: { in: homepageSectionDefinitions.map((section) => section.key) },
    },
  });
  const storedByKey = new Map(
    storedSections.map((section) => [section.key, section]),
  );

  return homepageSectionDefinitions
    .map((definition) => {
      const stored = storedByKey.get(definition.key);

      return {
        key: definition.key,
        label: definition.label,
        description: definition.description,
        isVisible: stored?.isVisible ?? true,
        sortOrder: stored?.sortOrder ?? definition.defaultSortOrder,
        contentTitle:
          stored?.contentTitle ?? definition.defaultContentTitle,
        contentDescription:
          stored?.contentDescription ?? definition.defaultContentDescription,
        imageUrl: stored?.imageUrl ?? definition.defaultImageUrl,
        mobileImageUrl:
          stored?.mobileImageUrl ?? definition.defaultMobileImageUrl,
        buttonLabel: stored?.buttonLabel ?? definition.defaultButtonLabel,
        buttonUrl: stored?.buttonUrl ?? definition.defaultButtonUrl,
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
