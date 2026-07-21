import type { ProductSuggestionInput } from "@/lib/productSuggestions";

export type WebResearchSource = {
  url: string;
  title: string | null;
  excerpt: string;
};

type BraveSearchPayload = {
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
    }>;
  };
};

const MAX_SOURCES = 3;

function parseSourceUrls(rawValue: string) {
  return rawValue
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, MAX_SOURCES);
}

function validateSourceUrl(value: string) {
  try {
    const url = new URL(value);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      isPrivateHost(url.hostname)
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase();

  if (host === "localhost" || host.endsWith(".localhost")) {
    return true;
  }

  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }

  const parts = host.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function stripHtml(html: string) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? null;
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: title?.replace(/\s+/g, " ").trim() || null,
    text: cleaned,
  };
}

export function isBraveWebResearchEnabled() {
  return Boolean(process.env.BRAVE_SEARCH_API_KEY?.trim());
}

function buildSearchQuery(product: ProductSuggestionInput) {
  const parts = [
    product.logoBrandName,
    product.brand,
    product.storeName,
    product.logoName,
    product.name,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set(parts)).join(" ").slice(0, 360);
}

async function searchBraveProductSources(product: ProductSuggestionInput) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY?.trim();
  const query = buildSearchQuery(product);

  if (!apiKey || !query) {
    return [];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const params = new URLSearchParams({
      q: `${query} ürün teknik bilgi`,
      count: "6",
      country: "TR",
      search_lang: "tr",
      safesearch: "strict",
    });
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Brave Search HTTP ${response.status}`);
    }

    const payload = (await response.json()) as BraveSearchPayload;

    return (payload.web?.results ?? [])
      .map((result) => result.url?.trim() ?? "")
      .filter(Boolean)
      .filter((url) => validateSourceUrl(url))
      .slice(0, MAX_SOURCES);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchWebResearchSourcesFromUrls(rawUrls: string[]) {
  const urls = rawUrls.slice(0, MAX_SOURCES);
  const sources: WebResearchSource[] = [];

  for (const rawUrl of urls) {
    const url = validateSourceUrl(rawUrl);

    if (!url) {
      continue;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          "user-agent":
            "Mozilla/5.0 (compatible; LaleEDT-CatalogBot/1.0; +https://laleedt.com.tr)",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
        continue;
      }

      const html = await response.text();
      const { title, text } = stripHtml(html);

      if (!text) {
        continue;
      }

      sources.push({
        url: url.toString(),
        title,
        excerpt: text.slice(0, 4500),
      });
    } catch {
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }

  return sources;
}

export async function fetchWebResearchSources(rawUrls: string) {
  return fetchWebResearchSourcesFromUrls(parseSourceUrls(rawUrls));
}

export async function discoverProductWebResearchSources(
  product: ProductSuggestionInput,
  manualUrls = "",
) {
  const manual = parseSourceUrls(manualUrls);
  const automatic = await searchBraveProductSources(product);
  const urls = Array.from(new Set([...manual, ...automatic])).slice(0, MAX_SOURCES);

  return fetchWebResearchSourcesFromUrls(urls);
}
