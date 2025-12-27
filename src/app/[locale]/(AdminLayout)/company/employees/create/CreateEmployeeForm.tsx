"use client";

import {
  BaseCreateUserForm,
  CreateUserFormData,
} from "@/app/[locale]/_components/_base/BaseCreateUserForm";
import { createCompanyEmployee } from "@/lib/apis/company-employees";
import { COMPANY_USER_ROLES } from "@/types/enums";

export function CreateEmployeeForm() {
  const handleSubmit = async (data: CreateUserFormData) => {
    await createCompanyEmployee(data);
  };

  return (
    <BaseCreateUserForm
      title="Thêm nhân viên mới"
      roles={COMPANY_USER_ROLES}
      defaultRole="USER_COMPANY"
      onSubmit={handleSubmit}
      submitButtonText="Thêm nhân viên"
      loadingText="Đang thêm nhân viên..."
      successMessage="Thêm nhân viên thành công!"
      successRedirectUrl="/company/employees"
    />
  );
}
