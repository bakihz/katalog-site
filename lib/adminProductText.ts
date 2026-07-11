import { prisma } from "@/lib/prisma";

const turkishLowerMap: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  i: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

export function slugifyProductText(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıiöşü]/g, (char) => turkishLowerMap[char] ?? char)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureUniqueProductSlug(slug: string, productId: number) {
  const baseSlug = slug || `urun-${productId}`;
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.product.findFirst({
      where: {
        slug: candidate,
        NOT: { id: productId },
      },
    })
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
