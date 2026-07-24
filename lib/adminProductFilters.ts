export const adminProductPageSizeOptions = [25, 50, 100] as const;
export const defaultAdminProductPageSize = 25;

export type AdminProductFilterParams = {
  q?: string;
  publicationStatus?: string;
  visibility?: string;
  logoStatus?: string;
  quality?: string;
  page?: string;
  pageSize?: string;
};

export type AdminProductFilters = {
  q: string;
  publicationStatus:
    | "all"
    | "draft"
    | "review"
    | "published"
    | "archived";
  logoStatus: "active" | "inactive" | "all";
  quality:
    | "all"
    | "missing-image"
    | "missing-category"
    | "missing-name"
    | "missing-slug"
    | "missing-description"
    | "category-review"
    | "suggestion-pending"
    | "incomplete"
    | "ready-to-publish";
  page: number;
  pageSize: (typeof adminProductPageSizeOptions)[number];
};

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminProductFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): AdminProductFilters {
  const getValue =
    params instanceof URLSearchParams
      ? (key: keyof AdminProductFilterParams) => params.get(key) ?? undefined
      : (key: keyof AdminProductFilterParams) => getFirstParam(params[key]);

  const requestedPage = Number(getValue("page") ?? 1);
  const requestedPageSize = Number(
    getValue("pageSize") ?? defaultAdminProductPageSize,
  );
  const publicationStatus =
    getValue("publicationStatus") ??
    (getValue("visibility") === "visible"
      ? "published"
      : getValue("visibility") === "hidden"
        ? "draft"
        : undefined);
  const logoStatus = getValue("logoStatus");
  const quality = getValue("quality");

  const pageSize = adminProductPageSizeOptions.includes(
    requestedPageSize as (typeof adminProductPageSizeOptions)[number],
  )
    ? (requestedPageSize as (typeof adminProductPageSizeOptions)[number])
    : defaultAdminProductPageSize;

  return {
    q: (getValue("q") ?? "").trim(),
    publicationStatus:
      publicationStatus === "draft" ||
      publicationStatus === "review" ||
      publicationStatus === "published" ||
      publicationStatus === "archived"
        ? publicationStatus
        : "all",
    logoStatus:
      logoStatus === "inactive" || logoStatus === "all" ? logoStatus : "active",
    quality:
      quality === "missing-image" ||
      quality === "missing-category" ||
      quality === "missing-name" ||
      quality === "missing-slug" ||
      quality === "missing-description" ||
      quality === "category-review" ||
      quality === "suggestion-pending" ||
      quality === "incomplete" ||
      quality === "ready-to-publish"
        ? quality
        : "all",
    page: Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    pageSize,
  };
}

export function buildAdminProductsQueryString(
  filters: AdminProductFilters,
  overrides: Partial<AdminProductFilterParams> = {},
) {
  const params = new URLSearchParams();
  const values: AdminProductFilterParams = {
    q: filters.q,
    publicationStatus: filters.publicationStatus,
    logoStatus: filters.logoStatus,
    quality: filters.quality,
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    ...overrides,
  };

  Object.entries(values).forEach(([key, value]) => {
    if (!value || value === "all" || (key === "page" && value === "1")) {
      return;
    }

    params.set(key, value);
  });

  return params.toString();
}
