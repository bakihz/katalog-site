import type { PaymentProvider } from "@prisma/client";

export type PaymentProviderRecord = PaymentProvider;

export type PaymentProviderAuditLog = {
  id: number;
  action: string;
  entityId: number | null;
  entityName: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: Date;
  actor: {
    name: string;
    username: string;
  } | null;
};
