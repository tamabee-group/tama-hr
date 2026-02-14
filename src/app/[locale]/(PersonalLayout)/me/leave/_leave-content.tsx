"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Plus, History } from "lucide-react";
import { toast } from "sonner";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style/_glass-tabs";
import { LeaveBalance } from "./_leave-balance";
import { LeaveRequestForm } from "./_leave-request-form";
import { LeaveHistory } from "./_leave-history";
import { leaveApi } from "@/lib/apis/leave-api";
import {
  LeaveBalance as LeaveBalanceType,
  LeaveRequest,
} from "@/types/attendance-records";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";

// ============================================
// Types
// ============================================

interface CachedData {
  balances: LeaveBalanceType[];
  requests: LeaveRequest[];
}

// ============================================
// Component
// ============================================

export function LeaveContent() {
  const t = useTranslations("portal.leave");
  const tErrors = useTranslations("errors");
  const searchParams = useSearchParams();
  const router = useRouter();

  // Lấy id từ URL query param
  const highlightIdParam = searchParams.get("id");
  const highlightId = highlightIdParam ? parseInt(highlightIdParam, 10) : null;

  // State
  const [cachedData, setCachedData] = React.useState<CachedData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState(
    highlightId ? "history" : "request",
  );

  // Tabs config
  const tabs = [
    {
      value: "request",
      label: t("requestLeave"),
      icon: <Plus className="h-4 w-4" />,
    },
    {
      value: "history",
      label: t("history"),
      icon: <History className="h-4 w-4" />,
    },
  ];

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [balances, requestsResponse] = await Promise.all([
        leaveApi.getMyLeaveBalance(),
        leaveApi.getMyLeaveRequests(0, 20),
      ]);
      setCachedData({ balances, requests: requestsResponse.content });
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setLoading(false);
    }
  }, [tErrors]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Subscribe to LEAVE notifications để auto-refresh
  React.useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("LEAVE", () => {
      fetchData();
    });
    return unsubscribe;
  }, [fetchData]);

  // Khi có highlightId, chuyển sang tab history
  React.useEffect(() => {
    if (highlightId) {
      setActiveTab("history");
    }
  }, [highlightId]);

  // Clear highlight khi đóng dialog
  const handleClearHighlight = React.useCallback(() => {
    // Xóa query param khỏi URL
    router.replace("/me/leave", { scroll: false });
  }, [router]);

  // Callback khi tạo request thành công
  const handleRequestSuccess = () => {
    fetchData();
  };

  // Loading state
  if (loading && !cachedData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Leave Balance Summary */}
      <LeaveBalance balances={cachedData?.balances || []} />

      {/* Tabs */}
      <GlassTabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === "request" && (
          <LeaveRequestForm
            balances={cachedData?.balances || []}
            onSuccess={handleRequestSuccess}
          />
        )}
        {activeTab === "history" && (
          <LeaveHistory
            requests={cachedData?.requests || []}
            onRefresh={fetchData}
            highlightId={highlightId}
            onClearHighlight={handleClearHighlight}
          />
        )}
      </div>
    </div>
  );
}
