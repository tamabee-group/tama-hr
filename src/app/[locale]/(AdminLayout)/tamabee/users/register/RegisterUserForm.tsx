"use client";

import {
  BaseCreateUserForm,
  CreateUserFormData,
} from "@/app/[locale]/_components/_base/BaseCreateUserForm";
import { createTamabeeUser } from "@/lib/apis/users";
import { TAMABEE_USER_ROLES } from "@/types/enums";

export function RegisterUserForm() {
  const handleSubmit = async (data: CreateUserFormData) => {
    await createTamabeeUser(data);
  };

  return (
    <BaseCreateUserForm
      title="Đăng ký người dùng mới"
      roles={TAMABEE_USER_ROLES}
      defaultRole="EMPLOYEE_TAMABEE"
      onSubmit={handleSubmit}
      submitButtonText="Đăng ký"
      loadingText="Đang đăng ký người dùng..."
      successMessage="Đăng ký thành công!"
      successRedirectUrl="/tamabee/users"
    />
  );
}
