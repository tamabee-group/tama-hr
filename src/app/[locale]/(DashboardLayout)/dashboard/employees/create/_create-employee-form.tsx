"use client";

import { useTranslations } from "next-intl";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import {
  BaseCreateUserForm,
  CreateUserFormData,
} from "@/app/[locale]/_components/_base/base-create-user-form";
import { createCompanyEmployee } from "@/lib/apis/company-employees";
import { COMPANY_USER_ROLES, TAMABEE_USER_ROLES } from "@/types/enums";
import { useAuth } from "@/hooks/use-auth";

export function CreateEmployeeForm() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const { isTamabeeUser } = useAuth();

  // Hiển thị role phù hợp với tenant
  const availableRoles = isTamabeeUser
    ? TAMABEE_USER_ROLES
    : COMPANY_USER_ROLES;
  const defaultRole = isTamabeeUser ? "EMPLOYEE_TAMABEE" : "EMPLOYEE_COMPANY";

  const handleSubmit = async (data: CreateUserFormData) => {
    await createCompanyEmployee(data);
  };

  return (
    <div className="space-y-4">
      <BackButton />
      <BaseCreateUserForm
        title={t("createUser")}
        roles={availableRoles}
        defaultRole={defaultRole}
        onSubmit={handleSubmit}
        submitButtonText={tCommon("add")}
        loadingText={tCommon("loading")}
        successMessage={t("messages.createSuccess")}
        successRedirectUrl="/dashboard/employees"
      />
    </div>
  );
}
