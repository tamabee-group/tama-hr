"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  type ProfileCompletionFields,
  PROFILE_COMPLETION_WEIGHTS,
} from "@/types/employee-portal";
import { type MyProfileResponse } from "@/lib/apis/my-profile-api";

// ============================================
// Types
// ============================================

interface ProfileProgressProps {
  profile: MyProfileResponse | null;
  className?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Kiểm tra xem một field có được điền hay không
 * Trả về true nếu field có giá trị (không null, undefined, hoặc chuỗi rỗng)
 */
function isFieldFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

/**
 * Kiểm tra xem thông tin ngân hàng có được điền đầy đủ hay không
 * Dựa trên loại ngân hàng (VN/JP) và loại ngân hàng Nhật (normal/yucho)
 */
function isBankInfoComplete(profile: MyProfileResponse): boolean {
  const { bankAccountType, japanBankType } = profile;

  // Nếu chưa chọn loại ngân hàng
  if (!bankAccountType) return false;

  // Ngân hàng Việt Nam
  if (bankAccountType === "VN") {
    return (
      isFieldFilled(profile.bankName) &&
      isFieldFilled(profile.bankAccount) &&
      isFieldFilled(profile.bankAccountName)
    );
  }

  // Ngân hàng Nhật Bản
  if (bankAccountType === "JP") {
    // Nếu chưa chọn loại ngân hàng Nhật
    if (!japanBankType) return false;

    // Ngân hàng thông thường
    if (japanBankType === "normal") {
      return (
        isFieldFilled(profile.bankName) &&
        isFieldFilled(profile.bankCode) &&
        isFieldFilled(profile.bankBranchCode) &&
        isFieldFilled(profile.bankBranchName) &&
        isFieldFilled(profile.bankAccount) &&
        isFieldFilled(profile.bankAccountName) &&
        isFieldFilled(profile.bankAccountCategory)
      );
    }

    // Ngân hàng Yucho (ゆうちょ銀行)
    if (japanBankType === "yucho") {
      return (
        isFieldFilled(profile.bankSymbol) &&
        isFieldFilled(profile.bankNumber) &&
        isFieldFilled(profile.bankAccountName)
      );
    }
  }

  return false;
}

/**
 * Kiểm tra xem thông tin liên hệ khẩn cấp có được điền đầy đủ hay không
 * Yêu cầu ít nhất tên và số điện thoại
 */
function isEmergencyContactComplete(profile: MyProfileResponse): boolean {
  return (
    isFieldFilled(profile.emergencyContactName) &&
    isFieldFilled(profile.emergencyContactPhone)
  );
}

/**
 * Tính toán các field đã được điền trong profile
 * Trả về object ProfileCompletionFields với giá trị boolean cho từng field
 */
export function getProfileCompletionFields(
  profile: MyProfileResponse | null,
): ProfileCompletionFields {
  if (!profile) {
    return {
      avatar: false,
      name: false,
      phone: false,
      dateOfBirth: false,
      gender: false,
      address: false,
      bankInfo: false,
      emergencyContact: false,
    };
  }

  return {
    avatar: isFieldFilled(profile.avatar),
    name: isFieldFilled(profile.name),
    phone: isFieldFilled(profile.phone),
    dateOfBirth: isFieldFilled(profile.dateOfBirth),
    gender: isFieldFilled(profile.gender),
    address: isFieldFilled(profile.address),
    bankInfo: isBankInfoComplete(profile),
    emergencyContact: isEmergencyContactComplete(profile),
  };
}

/**
 * Tính toán phần trăm hoàn thành profile dựa trên các field đã điền
 * Sử dụng weights được định nghĩa trong PROFILE_COMPLETION_WEIGHTS
 */
export function calculateProfileCompletion(
  profile: MyProfileResponse | null,
): number {
  const fields = getProfileCompletionFields(profile);

  let totalWeight = 0;
  let completedWeight = 0;

  // Tính tổng weight và weight đã hoàn thành
  (
    Object.keys(PROFILE_COMPLETION_WEIGHTS) as Array<
      keyof ProfileCompletionFields
    >
  ).forEach((key) => {
    const weight = PROFILE_COMPLETION_WEIGHTS[key];
    totalWeight += weight;
    if (fields[key]) {
      completedWeight += weight;
    }
  });

  // Tránh chia cho 0
  if (totalWeight === 0) return 0;

  // Làm tròn đến số nguyên
  return Math.round((completedWeight / totalWeight) * 100);
}

/**
 * Xác định màu progress bar dựa trên phần trăm hoàn thành
 * - >= 80%: green (tốt)
 * - >= 50%: yellow (trung bình)
 * - < 50%: red (cần cải thiện)
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

/**
 * Xác định text color cho percentage dựa trên mức độ hoàn thành
 */
export function getProgressTextColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600 dark:text-green-400";
  if (percentage >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

// ============================================
// Main Component
// ============================================

/**
 * ProfileProgress Component
 * Hiển thị thanh tiến trình hoàn thành profile với phần trăm
 * Tính toán dựa trên các field đã điền trong profile
 *
 * Requirements: 9.1, 9.2, 9.3
 */
export function ProfileProgress({ profile, className }: ProfileProgressProps) {
  const t = useTranslations("portal");

  // Tính toán phần trăm hoàn thành
  const completeness = calculateProfileCompletion(profile);

  // Xác định màu sắc
  const progressColor = getProgressColor(completeness);
  const textColor = getProgressTextColor(completeness);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header với label và percentage */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">{t("profile.completion")}</span>
        <span className={cn("font-medium", textColor)}>{completeness}%</span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 bg-muted rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={completeness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t("profile.completion")}: ${completeness}%`}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            progressColor,
          )}
          style={{ width: `${completeness}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// Exports
// ============================================

export type { ProfileProgressProps };
