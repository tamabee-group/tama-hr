"use client";

import { useTranslations } from "next-intl";
import {
  BaseCreateUserForm,
  CreateUserFormData,
} from "@/app/[locale]/_components/_base/base-create-user-form";
import { createTamabeeUser } from "@/lib/apis/users";
import { TAMABEE_USER_ROLES } from "@/types/enums";

export function RegisterUserForm() {
  const t = useTranslations("users");

  const handleSubmit = async (data: CreateUserFormData) => {
    await createTamabeeUser(data);
  };

  return (
    <BaseCreateUserForm
      title={t("form.title")}
      roles={TAMABEE_USER_ROLES}
      defaultRole="EMPLOYEE_TAMABEE"
      onSubmit={handleSubmit}
      submitButtonText={t("form.submitButton")}
      loadingText={t("form.loadingText")}
      successMessage={t("form.successMessage")}
      successRedirectUrl="/tamabee/users"
    />
  );
}
