"use client";

import { useTranslations } from "next-intl";
import {
  BaseUserProfileForm,
  UserProfileFormData,
} from "@/app/[locale]/_components/_base/base-user-profile-form";
import { uploadUserAvatar, updateUserProfile } from "@/lib/apis/admin-users";
import { TAMABEE_USER_ROLES } from "@/types/enums";
import { User } from "@/types/user";

export function UserProfileForm({ user }: { user: User }) {
  const t = useTranslations("users");

  const handleSave = async (userId: number, data: UserProfileFormData) => {
    await updateUserProfile(userId, data);
  };

  const handleUploadAvatar = async (userId: number, file: File) => {
    await uploadUserAvatar(userId, file);
  };

  return (
    <BaseUserProfileForm
      user={user}
      title={t("personalInfo")}
      roles={TAMABEE_USER_ROLES}
      onSave={handleSave}
      onUploadAvatar={handleUploadAvatar}
    />
  );
}
