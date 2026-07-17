export type WebResearchSource = {
  url: string;
  title: string | null;
  excerpt: string;
};

function parseSourceUrls(rawValue: string) {
  return rawValue
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function validateSourceUrl(value: string) {
  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
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

export async function fetchWebResearchSources(rawUrls: string) {
  const urls = parseSourceUrls(rawUrls);
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
