"use client";

import { useTranslations } from "next-intl";
import {
  BaseCreateUserForm,
  CreateUserFormData,
} from "@/app/[locale]/_components/_base/base-create-user-form";
import { createCompanyEmployee } from "@/lib/apis/company-employees";
import { COMPANY_USER_ROLES } from "@/types/enums";

export function CreateEmployeeForm() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");

  const handleSubmit = async (data: CreateUserFormData) => {
    await createCompanyEmployee(data);
  };

  return (
    <BaseCreateUserForm
      title={t("createUser")}
      roles={COMPANY_USER_ROLES}
      defaultRole="USER_COMPANY"
      onSubmit={handleSubmit}
      submitButtonText={tCommon("add")}
      loadingText={tCommon("loading")}
      successMessage={t("messages.createSuccess")}
      successRedirectUrl="/dashboard/employees"
    />
  );
}
