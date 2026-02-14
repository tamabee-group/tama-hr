"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { ProfileTabs, useProfileTabs } from "./_profile-tabs";
import { BasicInfoForm } from "./_basic-info-form";
import { WorkInfoSection } from "./_work-info-section";
import { BankInfoForm } from "./_bank-info-form";
import { EmergencyContactForm } from "./_emergency-contact-form";
import { GlassCard } from "../../../_components/_glass-style/_glass-card";

import {
  type MyProfileResponse,
  getMyProfile,
} from "@/lib/apis/my-profile-api";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// ============================================
// Loading Skeleton Component
// ============================================

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Progress bar skeleton */}
      <GlassCard className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      </GlassCard>

      {/* Tabs skeleton */}
      <Skeleton className="h-12 w-full rounded-2xl" />

      {/* Content skeleton */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================
// Error State Component
// ============================================

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");

  return (
    <GlassCard className="p-6">
      <div className="text-center space-y-4">
        <p className="text-destructive">{message}</p>
        <button
          onClick={onRetry}
          className="text-primary hover:underline"
          aria-label={t("retry")}
        >
          {t("retry")}
        </button>
      </div>
    </GlassCard>
  );
}

// ============================================
// Main Component
// ============================================

/**
 * ProfileContent Component
 * Client component quản lý state và render các section của Profile page
 *
 * Features:
 * - Fetch profile data từ API
 * - Quản lý active tab với ProfileTabs
 * - Render các section: BasicInfo, WorkInfo, BankInfo, EmergencyContact
 * - Loading skeleton và error handling
 */
export function ProfileContent() {
  const t = useTranslations("portal");
  const tErrors = useTranslations("errors");

  // Profile state
  const [profile, setProfile] = React.useState<MyProfileResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Tab state
  const { activeTab, setActiveTab } = useProfileTabs("basic");

  // ============================================
  // Data Fetching
  // ============================================

  const fetchProfile = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      console.error("Lỗi fetch profile:", err);
      const message = getErrorMessage(
        err,
        tErrors,
        t("profile.messages.saveError"),
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t, tErrors]);

  // Fetch profile khi mount
  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ============================================
  // Handlers
  // ============================================

  /**
   * Callback khi profile được cập nhật từ các form
   */
  const handleProfileUpdate = React.useCallback(
    (updatedProfile: MyProfileResponse) => {
      setProfile(updatedProfile);
    },
    [],
  );

  // ============================================
  // Render
  // ============================================

  // Loading state
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={fetchProfile} />;
  }

  // No profile data
  if (!profile) {
    return (
      <ErrorState
        message={t("profile.messages.saveError")}
        onRetry={fetchProfile}
      />
    );
  }

  // Render content dựa trên active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <BasicInfoForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "work":
        return <WorkInfoSection profile={profile} />;
      case "bank":
        return (
          <BankInfoForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "emergency":
        return (
          <EmergencyContactForm
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ProfileTabs
      activeTab={activeTab}
      onTabChange={setActiveTab}
      profile={profile}
    >
      {renderTabContent()}
    </ProfileTabs>
  );
}

// ============================================
// Exports
// ============================================

export default ProfileContent;
