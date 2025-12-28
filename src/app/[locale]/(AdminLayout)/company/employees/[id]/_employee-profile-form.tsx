"use client";

import {
  BaseUserProfileForm,
  UserProfileFormData,
} from "@/app/[locale]/_components/_base/base-user-profile-form";
import {
  uploadCompanyEmployeeAvatar,
  updateCompanyEmployee,
} from "@/lib/apis/company-employees";
import { COMPANY_USER_ROLES } from "@/types/enums";
import { User } from "@/types/user";

export function EmployeeProfileForm({ employee }: { employee: User }) {
  const handleSave = async (userId: number, data: UserProfileFormData) => {
    await updateCompanyEmployee(userId, data);
  };

  const handleUploadAvatar = async (userId: number, file: File) => {
    await uploadCompanyEmployeeAvatar(userId, file);
  };

  return (
    <BaseUserProfileForm
      user={employee}
      title="Thông tin nhân viên"
      roles={COMPANY_USER_ROLES}
      onSave={handleSave}
      onUploadAvatar={handleUploadAvatar}
    />
  );
}
