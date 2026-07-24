import { Prisma } from "@prisma/client";
import { getFirstSearchParam } from "@/lib/searchParams";

export const adminPaymentPageSizeOptions = [25, 50, 100] as const;
export const defaultAdminPaymentPageSize = 25;

export type AdminPaymentFilterParams = {
  q?: string;
  status?: string;
  agentId?: string;
  from?: string;
  to?: string;
  page?: string;
  pageSize?: string;
};

export type AdminPaymentFilters = {
  query: string;
  status: string;
  selectedAgentId: number;
  from: string;
  to: string;
  page: number;
  pageSize: number;
  where: Prisma.PaymentWhereInput;
};

export function parseAdminPaymentFilters(
  params: Record<string, string | string[] | undefined> | URLSearchParams,
): AdminPaymentFilters {
  const getParam =
    params instanceof URLSearchParams
      ? (key: keyof AdminPaymentFilterParams) => params.get(key) ?? undefined
      : (key: keyof AdminPaymentFilterParams) =>
          getFirstSearchParam(params[key]);

  const query = (getParam("q") ?? "").trim();
  const status = (getParam("status") ?? "").trim();
  const from = normalizeDateParam(getParam("from"));
  const to = normalizeDateParam(getParam("to"));
  const agentId = Number(getParam("agentId") ?? "");
  const page = Math.max(1, Number(getParam("page") ?? "1") || 1);
  const requestedPageSize = Number(getParam("pageSize") ?? "");
  const pageSize = adminPaymentPageSizeOptions.includes(
    requestedPageSize as (typeof adminPaymentPageSizeOptions)[number],
  )
    ? requestedPageSize
    : defaultAdminPaymentPageSize;
  const selectedAgentId = Number.isInteger(agentId) && agentId > 0 ? agentId : 0;
  const createdAt = getCreatedAtFilter(from, to);

  const where: Prisma.PaymentWhereInput = {
    ...(selectedAgentId ? { agentId: selectedAgentId } : {}),
    ...(status ? { status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(query
      ? {
          OR: [
            { customerName: { contains: query } },
            { companyName: { contains: query } },
            { description: { contains: query } },
            { orderId: { contains: query } },
            { providerName: { contains: query } },
          ],
        }
      : {}),
  };

  return {
    query,
    status,
    selectedAgentId,
    from,
    to,
    page,
    pageSize,
    where,
  };
}

export function buildAdminPaymentsQueryString(
  filters: AdminPaymentFilters,
  overrides: Partial<AdminPaymentFilterParams> = {},
) {
  const params = new URLSearchParams();
  const values: AdminPaymentFilterParams = {
    q: filters.query,
    status: filters.status,
    agentId: filters.selectedAgentId ? String(filters.selectedAgentId) : "",
    from: filters.from,
    to: filters.to,
    page: String(filters.page),
    pageSize: String(filters.pageSize),
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }

  return params.toString();
}

function normalizeDateParam(value: string | undefined) {
  const date = (value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function getCreatedAtFilter(from: string, to: string) {
  if (!from && !to) return undefined;

  const filter: Prisma.DateTimeFilter = {};

  if (from) {
    filter.gte = new Date(`${from}T00:00:00.000`);
  }

  if (to) {
    filter.lt = new Date(`${to}T00:00:00.000`);
    filter.lt.setDate(filter.lt.getDate() + 1);
  }

  return filter;
}
