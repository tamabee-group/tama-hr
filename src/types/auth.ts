import { User, UserRole } from "./user";

// Re-export User as AuthUser cho consistency với design
export type AuthUser = User;

// Helper type để check Tamabee roles
export const TAMABEE_ADMIN_ROLES: UserRole[] = [
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
];

// Helper type để check Company admin roles
export const COMPANY_ADMIN_ROLES: UserRole[] = [
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
];

// Check if user is Tamabee user (tenantDomain === "tamabee")
export function isTamabeeUser(user: User | null): boolean {
  return user?.tenantDomain === "tamabee";
}

// Check if user is Tamabee admin (ADMIN_TAMABEE or MANAGER_TAMABEE)
export function isTamabeeAdmin(user: User | null): boolean {
  if (!user) return false;
  return TAMABEE_ADMIN_ROLES.includes(user.role);
}

// Check if user is Company admin (ADMIN_COMPANY or MANAGER_COMPANY)
export function isCompanyAdmin(user: User | null): boolean {
  if (!user) return false;
  return COMPANY_ADMIN_ROLES.includes(user.role);
}
