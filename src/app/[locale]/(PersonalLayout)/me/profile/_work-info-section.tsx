"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  Hash,
  User,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";

import { type MyProfileResponse } from "@/lib/apis/my-profile-api";
import { formatDate } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";

// ============================================
// Types
// ============================================

interface WorkInfoSectionProps {
  profile: MyProfileResponse;
}

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}

// ============================================
// Sub Components
// ============================================

/**
 * InfoField Component
 * Hiển thị một field thông tin với icon và label
 */
function InfoField({ icon, label, value }: InfoFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </Label>
      <p className="text-sm font-medium pl-6">{value || "-"}</p>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * WorkInfoSection Component
 * Hiển thị thông tin công việc của nhân viên (readonly)
 *
 * Features:
 * - Hiển thị mã nhân viên, phòng ban, chức vụ
 * - Hiển thị ngày vào làm, loại hợp đồng
 * - Hiển thị quản lý trực tiếp (nếu có)
 * - Tất cả các field đều readonly
 */
export function WorkInfoSection({ profile }: WorkInfoSectionProps) {
  const t = useTranslations("portal");
  const tEnums = useTranslations("enums");

  // Format ngày vào làm
  const formattedJoiningDate = profile.joiningDate
    ? formatDate(profile.joiningDate)
    : undefined;

  // Lấy label cho loại hợp đồng
  const contractTypeLabel = profile.contractType
    ? getEnumLabel("contractType", profile.contractType, tEnums)
    : undefined;

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("profile.tabs.work")}</h3>
        </div>

        {/* Info fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mã nhân viên */}
          <InfoField
            icon={<Hash className="h-4 w-4" />}
            label={t("profile.workInfo.employeeCode")}
            value={profile.employeeCode}
          />

          {/* Phòng ban */}
          <InfoField
            icon={<Building2 className="h-4 w-4" />}
            label={t("profile.workInfo.department")}
            value={profile.department}
          />

          {/* Chức vụ */}
          <InfoField
            icon={<Briefcase className="h-4 w-4" />}
            label={t("profile.workInfo.jobTitle")}
            value={profile.jobTitle}
          />

          {/* Ngày vào làm */}
          <InfoField
            icon={<Calendar className="h-4 w-4" />}
            label={t("profile.workInfo.joiningDate")}
            value={formattedJoiningDate}
          />

          {/* Loại hợp đồng */}
          <InfoField
            icon={<FileText className="h-4 w-4" />}
            label={t("profile.workInfo.contractType")}
            value={contractTypeLabel}
          />

          {/* Quản lý trực tiếp - chỉ hiển thị nếu có */}
          {profile.managerName && (
            <InfoField
              icon={<User className="h-4 w-4" />}
              label={t("profile.workInfo.manager")}
              value={profile.managerName}
            />
          )}
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// Exports
// ============================================

export type { WorkInfoSectionProps };
