import { apiServer } from "@/lib/utils/fetch-server";
import { Company } from "@/types/company";
import { CompanyProfileForm } from "./_company-profile-form";
import { User } from "@/types/user";

const EDIT_ROLES = [
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
];

export default async function ProfilePage() {
  const user = await apiServer.get<User>("/api/auth/me");
  const company = await apiServer.get<Company>("/api/company/profile");
  const canEdit = EDIT_ROLES.includes(user.role);

  return <CompanyProfileForm company={company} canEdit={canEdit} />;
}
