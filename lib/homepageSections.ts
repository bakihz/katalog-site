import { prisma } from "@/lib/prisma";

export const homepageSectionDefinitions = [
  {
    key: "hero",
    label: "Karşılama Alanı",
    description: "Ana başlık, vurgulu metin ve katalog tanıtım açıklaması.",
    defaultSortOrder: 10,
    defaultContentTitle: null,
    defaultContentDescription: null,
  },
  {
    key: "categoryShowcase",
    label: "Kategori Vitrini",
    description: "Öne çıkarılan kategorileri büyük görsel kartlarla sunar.",
    defaultSortOrder: 20,
    defaultContentTitle: "Kategorileri Keşfedin",
    defaultContentDescription:
      "İhtiyacınıza uygun ürün gruplarını inceleyerek aradığınız ürünlere daha hızlı ulaşın.",
  },
  {
    key: "catalog",
    label: "Ürün Kataloğu",
    description: "Arama, kategori filtreleri ve yayınlanan ürünlerin listesi.",
    defaultSortOrder: 30,
    defaultContentTitle: null,
    defaultContentDescription: null,
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
      };
    })
    .sort((left, right) => left.sortOrder - right.sortOrder);
}
