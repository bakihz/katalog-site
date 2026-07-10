import { NextRequest } from "next/server";
import { getAdminSessionUserId } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rateLimit";

type AdminAuditLogInput = {
  action: string;
  entityType: string;
  entityId?: number | null;
  entityName?: string | null;
  details?: Record<string, unknown> | null;
};

export async function writeAdminAuditLog(
  req: NextRequest,
  input: AdminAuditLogInput,
) {
  try {
    const actorId = await getAdminSessionUserId(
      req.cookies.get("admin_session")?.value,
    );

    await prisma.adminAuditLog.create({
      data: {
        actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        entityName: input.entityName ?? null,
        details: input.details ? JSON.stringify(input.details) : null,
        ipAddress: getClientIp(req),
      },
    });
  } catch (error) {
    console.error("[AdminAuditLogError]", error);
  }
}

export function getChangedFields(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  return Object.keys(after).filter((key) => before[key] !== after[key]);
}
