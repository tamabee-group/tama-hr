import { getTranslations } from "next-intl/server";
import { apiServer } from "@/lib/utils/fetch-server";
import { Company } from "@/types/company";
import { ProfileForm } from "./_profile-form";
import { User } from "@/types/user";

const EDIT_ROLES = [
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
];

export default async function ProfilePage() {
  const t = await getTranslations("companies");

  const [company, user] = await Promise.all([
    apiServer.get<Company>("/api/company/profile"),
    apiServer.get<User>("/api/auth/me"),
  ]);

  const canEdit = EDIT_ROLES.includes(user.role);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("companyInfo")}</h1>
      <ProfileForm company={company} canEdit={canEdit} />
    </div>
  );
}
