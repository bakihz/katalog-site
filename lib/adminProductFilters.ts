export const adminProductPageSizeOptions = [25, 50, 100] as const;
export const defaultAdminProductPageSize = 25;

export type AdminProductFilterParams = {
  q?: string;
  visibility?: string;
  quality?: string;
  page?: string;
  pageSize?: string;
};

export type AdminProductFilters = {
  q: string;
  visibility: "all" | "visible" | "hidden";
  quality: "all" | "missing-image" | "missing-category" | "missing-name";
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
  const visibility = getValue("visibility");
  const quality = getValue("quality");

  const pageSize = adminProductPageSizeOptions.includes(
    requestedPageSize as (typeof adminProductPageSizeOptions)[number],
  )
    ? (requestedPageSize as (typeof adminProductPageSizeOptions)[number])
    : defaultAdminProductPageSize;

  return {
    q: (getValue("q") ?? "").trim(),
    visibility:
      visibility === "visible" || visibility === "hidden" ? visibility : "all",
    quality:
      quality === "missing-image" ||
      quality === "missing-category" ||
      quality === "missing-name"
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
    visibility: filters.visibility,
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
