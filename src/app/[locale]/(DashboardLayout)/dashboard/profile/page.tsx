import { getTranslations } from "next-intl/server";
import { apiServer } from "@/lib/utils/fetch-server";
import { Company } from "@/types/company";
import { ProfileForm } from "./_profile-form";
import { SubscriptionCard } from "./_subscription-card";
import { User } from "@/types/user";

// Các role được phép edit company profile
const EDIT_ROLES = [
  "ADMIN_COMPANY",
  "MANAGER_COMPANY",
  "ADMIN_TAMABEE",
  "MANAGER_TAMABEE",
];

/**
 * Trang thông tin công ty
 * Server Component
 */
export default async function ProfilePage() {
  const t = await getTranslations("companies");

  // Lấy thông tin công ty và user hiện tại
  const [company, user] = await Promise.all([
    apiServer.get<Company>("/api/company/profile"),
    apiServer.get<User>("/api/auth/me"),
  ]);

  // Chỉ Admin/Manager mới được edit
  const canEdit = EDIT_ROLES.includes(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("companyInfo")}</h1>
      </div>
      <ProfileForm company={company} canEdit={canEdit} />
      <SubscriptionCard company={company} />
    </div>
  );
}
