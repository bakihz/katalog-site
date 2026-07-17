import { readFileSync } from "node:fs";
import path from "node:path";
import type { ProductSuggestionInput } from "@/lib/productSuggestions";

export type GoogleTaxonomyEntry = {
  id: string;
  path: string;
};

export type GoogleTaxonomyCandidate = GoogleTaxonomyEntry & {
  score: number;
};

let cachedEntries: GoogleTaxonomyEntry[] | null = null;

const preferredRoots = [
  "Yiyecek, İçecek ve Tütün",
  "Ev ve Bahçe",
  "İş ve Endüstriyel",
  "Sanat ve Eğlence",
];

const keywordBoosts: Array<[RegExp, string[]]> = [
  [/jel|boya|renk|gıda boyası/i, ["gıda", "dekor", "süs", "pasta"]],
  [/çikolata|kuvertür|kakao|damla/i, ["çikolata", "kakao", "pişirme"]],
  [/yağ|margarin|tereyağ/i, ["yağ", "pişirme", "yiyecek"]],
  [/ambalaj|kutu|poşet|kap/i, ["ambalaj", "kap", "çanta"]],
  [/krema|süt|peynir/i, ["süt", "krema", "yiyecek"]],
  [/sos|dolgu|jöle|glazür/i, ["sos", "dolgu", "yiyecek"]],
  [/aroma|esans/i, ["aroma", "yiyecek"]],
  [/baharat|tarçın|karabiber|kimyon/i, ["baharat", "yiyecek"]],
];

const minimumCandidateScore = 7;

function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTaxonomyPath() {
  return path.join(process.cwd(), "google-taxonomy.tr-TR.txt");
}

export function getGoogleTaxonomyEntries() {
  if (cachedEntries) {
    return cachedEntries;
  }

  const content = readFileSync(getTaxonomyPath(), "utf8");

  cachedEntries = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const match = line.match(/^(\d+)\s+-\s+(.+)$/);

      if (!match) {
        return null;
      }

      return {
        id: match[1],
        path: match[2],
      } satisfies GoogleTaxonomyEntry;
    })
    .filter((entry): entry is GoogleTaxonomyEntry => Boolean(entry));

  return cachedEntries;
}

function getProductText(product: ProductSuggestionInput) {
  return [
    product.name,
    product.logoName,
    product.storeName,
    product.logoDescription2,
    product.logoDescription3,
    product.logoCategoryRaw,
    product.logoSubCategoryRaw,
    product.category,
    product.subCategory,
  ]
    .filter(Boolean)
    .join(" ");
}

function scoreEntry(entry: GoogleTaxonomyEntry, productText: string) {
  const normalizedProduct = normalize(productText);
  const normalizedPath = normalize(entry.path);
  const productWords = new Set(normalizedProduct.split(" ").filter(Boolean));
  let score = 0;

  for (const word of productWords) {
    if (word.length > 2 && normalizedPath.includes(word)) {
      score += word.length > 5 ? 3 : 1;
    }
  }

  for (const root of preferredRoots) {
    if (entry.path.startsWith(root)) {
      score += 3;
    }
  }

  for (const [rule, boosts] of keywordBoosts) {
    if (rule.test(productText)) {
      for (const boost of boosts) {
        if (normalizedPath.includes(normalize(boost))) {
          score += 5;
        }
      }
    }
  }

  const depth = entry.path.split(">").length;
  score += Math.min(depth, 5) * 0.25;

  return score;
}

export function findGoogleTaxonomyCandidates(
  product: ProductSuggestionInput,
  limit = 20,
) {
  const productText = getProductText(product);

  return getGoogleTaxonomyEntries()
    .map((entry) => ({
      ...entry,
      score: scoreEntry(entry, productText),
    }))
    .filter((entry) => entry.score >= minimumCandidateScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ id, path, score }) => ({ id, path, score }));
}

export function findBestGoogleTaxonomyCandidate(
  product: ProductSuggestionInput,
) {
  const [best, second] = findGoogleTaxonomyCandidates(product, 2);

  if (!best) {
    return null;
  }

  if (second && best.score - second.score < 2 && best.score < 12) {
    return null;
  }

  return best;
}

export function findGoogleTaxonomyCandidateById(
  candidates: GoogleTaxonomyCandidate[],
  id: string | null,
) {
  if (!id) {
    return null;
  }

  return candidates.find((candidate) => candidate.id === id) ?? null;
}
