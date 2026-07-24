import { getRequestBaseUrl } from "@/lib/requestUrl";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { matchCatalogCategorySuggestion } from "@/lib/catalogCategoryMatching";
import { generateOllamaProductSuggestion } from "@/lib/ollamaProductSuggestions";
import { generateRuleBasedProductSuggestion } from "@/lib/productSuggestions";
import {
  discoverProductWebResearchSources,
  fetchWebResearchSources,
} from "@/lib/webResearch";

function limitText(value: string | null | undefined, maxLength: number) {
  if (!value) return value ?? null;
  const normalized = value.trim();
  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);
  const baseUrl = getRequestBaseUrl(req);

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.redirect(`${baseUrl}/admin/products?error=not-found`, {
      status: 303,
    });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    return NextResponse.redirect(`${baseUrl}/admin/products?error=not-found`, {
      status: 303,
    });
  }

  try {
    const formData = await req.formData();
    const engine = String(formData.get("engine") ?? "rule");
    const sourceUrls = String(formData.get("sourceUrls") ?? "");
    const autoResearch = formData.get("autoResearch") === "true";
    const webSources = autoResearch
      ? await discoverProductWebResearchSources(product, sourceUrls)
      : sourceUrls.trim()
        ? await fetchWebResearchSources(sourceUrls)
        : [];
    const suggestion =
      engine === "ollama" || engine === "web-ollama"
        ? await generateOllamaProductSuggestion(product, { webSources })
        : generateRuleBasedProductSuggestion(product);
    const categories = await prisma.catalogCategory.findMany({
      where: { isActive: true },
      include: { subcategories: { where: { isActive: true } } },
    });
    const categoryMatch = matchCatalogCategorySuggestion({
      categories,
      suggestedCategory: suggestion.suggestedCategory,
      suggestedSubCategory: suggestion.suggestedSubCategory,
    });
    const safeSuggestion = {
      ...suggestion,
      suggestedName: limitText(suggestion.suggestedName, 250),
      suggestedShortDescription: limitText(
        suggestion.suggestedShortDescription,
        1000,
      ),
      suggestedDescription: limitText(suggestion.suggestedDescription, 1000),
      suggestedCategory: limitText(suggestion.suggestedCategory, 250),
      suggestedSubCategory: limitText(suggestion.suggestedSubCategory, 250),
      suggestedBrand: limitText(suggestion.suggestedBrand, 250),
      suggestedFeatures: limitText(suggestion.suggestedFeatures, 1000),
      suggestedGoogleTaxonomyId: limitText(
        suggestion.suggestedGoogleTaxonomyId,
        250,
      ),
      suggestedGoogleTaxonomyPath: limitText(
        suggestion.suggestedGoogleTaxonomyPath,
        1000,
      ),
      suggestedSourceUrls: limitText(suggestion.suggestedSourceUrls, 1000),
      suggestedLearningNotes: limitText(suggestion.suggestedLearningNotes, 1000),
      suggestionVerificationStatus: suggestion.suggestionVerificationStatus ?? "review",
      suggestionWarnings: limitText(suggestion.suggestionWarnings, 1000),
      suggestionSource: limitText(suggestion.suggestionSource, 250),
    };

    await prisma.product.update({
      where: { id: productId },
      data: {
        ...safeSuggestion,
        suggestionStatus: "draft",
        categoryReviewStatus: categoryMatch.status,
        categorySuggestion: categoryMatch.categorySuggestion,
        subCategorySuggestion: categoryMatch.subCategorySuggestion,
        suggestionGeneratedAt: new Date(),
      } as Prisma.ProductUpdateInput,
    });
  } catch (error) {
    console.error("[AdminProductSuggestError]", error);
    return NextResponse.redirect(
      `${baseUrl}/admin/products/${productId}?error=${
        error instanceof Error && error.message.includes("Ollama")
          ? "ollama-suggestion"
          : error instanceof Error && error.message.includes("Brave Search")
            ? "web-research"
            : "suggestion"
      }`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(
    `${baseUrl}/admin/products/${productId}?success=suggestion-created`,
    { status: 303 },
  );
}
