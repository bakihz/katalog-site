export const USER_ROLES = {
  AGENT: "agent",
  FINANCE: "finance",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const userRoleOptions: Array<{ value: UserRole; label: string }> = [
  { value: USER_ROLES.AGENT, label: "Temsilci" },
  { value: USER_ROLES.FINANCE, label: "Finans Yetkisi" },
];

export function normalizeUserRole(value: unknown): UserRole {
  return value === USER_ROLES.FINANCE ? USER_ROLES.FINANCE : USER_ROLES.AGENT;
}

export function getUserRole(user: unknown): UserRole {
  if (user && typeof user === "object" && "role" in user) {
    return normalizeUserRole(user.role);
  }

  return USER_ROLES.AGENT;
}

export function canViewAllPayments(user: unknown) {
  return getUserRole(user) === USER_ROLES.FINANCE;
}

export function getUserRoleLabel(user: unknown) {
  const role = getUserRole(user);
  return userRoleOptions.find((option) => option.value === role)?.label;
}
