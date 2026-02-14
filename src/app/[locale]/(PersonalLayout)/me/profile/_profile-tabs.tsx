"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { User, Briefcase, Building2, Phone } from "lucide-react";

import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
import { type MyProfileResponse } from "@/lib/apis/my-profile-api";
import {
  ProfileProgress,
  calculateProfileCompletion,
} from "./_profile-progress";

// ============================================
// Types
// ============================================

export type ProfileTab = "basic" | "work" | "bank" | "emergency";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  profile: MyProfileResponse | null;
  children: React.ReactNode;
}

interface TabConfig {
  key: ProfileTab;
  icon: React.ElementType;
  labelKey: string;
}

// ============================================
// Constants
// ============================================

const SESSION_STORAGE_KEY = "profile-active-tab";

const TAB_CONFIGS: TabConfig[] = [
  { key: "basic", icon: User, labelKey: "tabs.basic" },
  { key: "work", icon: Briefcase, labelKey: "tabs.work" },
  { key: "bank", icon: Building2, labelKey: "tabs.bank" },
  { key: "emergency", icon: Phone, labelKey: "tabs.emergency" },
];

// ============================================
// Main Component
// ============================================

export function ProfileTabs({
  activeTab,
  onTabChange,
  profile,
  children,
}: ProfileTabsProps) {
  const t = useTranslations("portal");

  // Lưu active tab vào sessionStorage khi thay đổi
  const handleTabChange = React.useCallback(
    (value: string) => {
      const tab = value as ProfileTab;
      onTabChange(tab);
      // Lưu vào sessionStorage để nhớ tab đang active
      if (typeof window !== "undefined") {
        sessionStorage.setItem(SESSION_STORAGE_KEY, tab);
      }
    },
    [onTabChange],
  );

  // Khôi phục active tab từ sessionStorage khi mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = sessionStorage.getItem(
        SESSION_STORAGE_KEY,
      ) as ProfileTab | null;
      if (savedTab && TAB_CONFIGS.some((config) => config.key === savedTab)) {
        onTabChange(savedTab);
      }
    }
  }, [onTabChange]);

  return (
    <div className="space-y-6">
      {/* Progress bar - sử dụng standalone ProfileProgress component */}
      <ProfileProgress profile={profile} />

      {/* Tabs */}
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <GlassTabs
          tabs={TAB_CONFIGS.map((config) => ({
            value: config.key,
            label: t(`profile.${config.labelKey}`),
            icon: <config.icon className="h-4 w-4" aria-hidden="true" />,
          }))}
          value={activeTab}
          onChange={(value) => handleTabChange(value)}
        />
      </div>

      {/* Tab content */}
      <div className="mt-6">{children}</div>
    </div>
  );
}

// ============================================
// Helper Hook
// ============================================

/**
 * Hook để quản lý state của ProfileTabs
 * Tự động khôi phục tab từ sessionStorage
 */
export function useProfileTabs(defaultTab: ProfileTab = "basic") {
  const [activeTab, setActiveTab] = React.useState<ProfileTab>(defaultTab);

  // Khôi phục từ sessionStorage khi mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = sessionStorage.getItem(
        SESSION_STORAGE_KEY,
      ) as ProfileTab | null;
      if (savedTab && TAB_CONFIGS.some((config) => config.key === savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, []);

  return {
    activeTab,
    setActiveTab,
  };
}

// ============================================
// Exports
// ============================================

export { SESSION_STORAGE_KEY, TAB_CONFIGS, calculateProfileCompletion };
export type { ProfileTabsProps, TabConfig };
