import { prisma } from "@/lib/prisma";

const db = prisma as typeof prisma & {
  logoBrandReference: {
    findUnique: (args: {
      where: { logicalRef: number };
      select: { name: true };
    }) => Promise<{ name: string } | null>;
  };
  logoUnitReference: {
    findUnique: (args: {
      where: { unitSetRef: number };
      select: { mainUnitName: true; setName: true };
    }) => Promise<{ mainUnitName: string | null; setName: string | null } | null>;
  };
};

export async function resolveLogoBrandName(logoBrandRef: number | null) {
  if (!logoBrandRef) {
    return null;
  }

  const brand = await db.logoBrandReference.findUnique({
    where: { logicalRef: logoBrandRef },
    select: { name: true },
  });

  return brand?.name ?? null;
}

export async function resolveLogoUnitName(logoUnitSetRef: number | null) {
  if (!logoUnitSetRef) {
    return null;
  }

  const unit = await db.logoUnitReference.findUnique({
    where: { unitSetRef: logoUnitSetRef },
    select: { mainUnitName: true, setName: true },
  });

  return unit?.mainUnitName || unit?.setName || null;
}
