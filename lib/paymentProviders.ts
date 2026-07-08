import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Provider definitions
// ---------------------------------------------------------------------------

type ProviderKey = "ziraat" | "halkbank" | "teb";

const PROVIDER_DEFS: Record<
  ProviderKey,
  {
    name: string;
    legacyNames: string[];
    envPrefix: string;
    label: string;
  }
> = {
  ziraat: {
    name: "Ziraat Sanal POS",
    legacyNames: [
      "Ziraat Sanal POS",
      "Ziraat Test POS",
      "Ziraat Bankası",
      "Ziraat Bankasi",
    ],
    envPrefix: "ZIRAAT",
    label: "Ziraat",
  },
  halkbank: {
    name: "Halkbank Sanal POS",
    legacyNames: ["Halkbank Sanal POS"],
    envPrefix: "HALKBANK",
    label: "Halkbank",
  },
  teb: {
    name: "TEB Sanal POS",
    legacyNames: ["TEB Sanal POS"],
    envPrefix: "TEB",
    label: "TEB",
  },
};

// ---------------------------------------------------------------------------
// Named provider exports (backward-compat + Halkbank / TEB additions)
// ---------------------------------------------------------------------------

export const ZIRAAT_PROVIDER_NAME = PROVIDER_DEFS.ziraat.name;
export const HALKBANK_PROVIDER_NAME = PROVIDER_DEFS.halkbank.name;
export const TEB_PROVIDER_NAME = PROVIDER_DEFS.teb.name;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentProviderGatewayConfig = {
  displayName: string;
  clientId: string;
  storeKey: string;
  gatewayUrl: string;
};

// ---------------------------------------------------------------------------
// Config resolver — reads credentials from the database
// ---------------------------------------------------------------------------

export async function getPaymentProviderConfigByName(
  providerName: string | null | undefined,
): Promise<PaymentProviderGatewayConfig | null> {
  if (!providerName) return null;

  // Resolve canonical name via legacy-name lookup
  const def = Object.values(PROVIDER_DEFS).find((d) =>
    d.legacyNames.includes(providerName),
  );
  if (!def) return null;

  const provider = await prisma.paymentProvider.findFirst({
    where: { name: def.name },
  });

  if (
    !provider ||
    !provider.merchantId ||
    !provider.storeKey ||
    !provider.gatewayUrl
  ) {
    return null;
  }

  return {
    displayName: provider.name,
    clientId: provider.merchantId,
    storeKey: provider.storeKey,
    gatewayUrl: provider.gatewayUrl,
  };
}

// ---------------------------------------------------------------------------
// Seed helpers
// ---------------------------------------------------------------------------

export async function ensurePaymentProvider(key: ProviderKey) {
  const def = PROVIDER_DEFS[key];
  const merchantId = process.env[`${def.envPrefix}_CLIENT_ID`] ?? null;

  // Find ALL entries matching any legacy name (including old variants)
  const existing = await prisma.paymentProvider.findMany({
    where: { name: { in: def.legacyNames } },
    orderBy: { id: "asc" },
  });

  if (existing.length === 0) {
    return prisma.paymentProvider.create({
      data: {
        name: def.name,
        merchantId,
        apiUser: def.label,
        isActive: false,
      },
    });
  }

  // Pick the canonical entry (preferred) or fall back to the oldest
  const canonical = existing.find((p) => p.name === def.name) ?? existing[0];
  const duplicates = existing.filter((p) => p.id !== canonical.id);

  // If any duplicate was active, the canonical should inherit that status
  const anyDuplicateActive = duplicates.some((p) => p.isActive);

  const updated = await prisma.paymentProvider.update({
    where: { id: canonical.id },
    data: {
      name: def.name,
      merchantId: merchantId ?? canonical.merchantId,
      apiUser: canonical.apiUser ?? def.label,
      ...(anyDuplicateActive ? { isActive: true } : {}),
    },
  });

  // Clean up all duplicates
  if (duplicates.length > 0) {
    await prisma.paymentProvider.deleteMany({
      where: { id: { in: duplicates.map((p) => p.id) } },
    });
  }

  return updated;
}

/** Ensures all three providers exist in the database. */
export async function ensureAllPaymentProviders() {
  return Promise.all([
    ensurePaymentProvider("ziraat"),
    ensurePaymentProvider("halkbank"),
    ensurePaymentProvider("teb"),
  ]);
}

// Backward-compat alias
export async function ensureZiraatPaymentProvider() {
  return ensurePaymentProvider("ziraat");
}
