"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  CommissionResponse,
  CommissionSummaryResponse,
  CommissionSettingsResponse,
} from "@/types/commission";
import { commissionApi } from "@/lib/apis/commission-api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { CommissionStatus } from "@/types/enums";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { useLocale } from "next-intl";
import { ReferralTab } from "./_referral-tab";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";

type MainTab = "referral" | "commissions";
type TabStatus = "ALL" | CommissionStatus;

/**
 * Client component chứa state và logic cho trang hoa hồng của Employee
 * Fetch data 1 lần khi mount, filter ở client-side
 */
export function EmployeeCommissionsPageContent() {
  const t = useTranslations("commissions");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [mainTab, setMainTab] = useState<MainTab>("referral");
  const [allCommissions, setAllCommissions] = useState<CommissionResponse[]>(
    [],
  );
  const [summary, setSummary] = useState<CommissionSummaryResponse | null>(
    null,
  );
  const [settings, setSettings] = useState<CommissionSettingsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");

  const mainTabs: { value: MainTab; label: string }[] = [
    { value: "referral", label: t("tabs.referral") },
    { value: "commissions", label: t("tabs.commissions") },
  ];

  const tabs: { value: TabStatus; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "PENDING", label: t("tabs.pending") },
    { value: "ELIGIBLE", label: t("tabs.eligible") },
    { value: "PAID", label: t("tabs.paid") },
  ];

  // Fetch tất cả data 1 lần khi mount
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, settingsData, commissionsData] = await Promise.all([
        commissionApi.getMySummary(),
        commissionApi.getMySettings(),
        commissionApi.getMyCommissions({}, 0, 100), // Lấy tất cả commissions
      ]);
      setSummary(summaryData);
      setSettings(settingsData);
      setAllCommissions(commissionsData.content);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter commissions ở client-side
  const filteredCommissions = useMemo(() => {
    if (activeTab === "ALL") {
      return allCommissions;
    }
    return allCommissions.filter((c) => c.status === activeTab);
  }, [allCommissions, activeTab]);

  const columns: ColumnDef<CommissionResponse>[] = [
    {
      accessorKey: "companyName",
      header: t("table.company"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("companyName")}</span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("table.amount"),
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          {formatCurrency(row.getValue("amount"))}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as CommissionStatus;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              status === "PENDING" && "bg-yellow-100 text-yellow-800",
              status === "ELIGIBLE" && "bg-blue-100 text-blue-800",
              status === "PAID" && "bg-green-100 text-green-800",
            )}
          >
            {getEnumLabel("commissionStatus", status, tEnums)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => formatDateTime(row.getValue("createdAt"), locale),
    },
    {
      accessorKey: "paidAt",
      header: t("table.paidAt"),
      cell: ({ row }) => {
        const paidAt = row.getValue("paidAt") as string | undefined;
        return paidAt ? formatDateTime(paidAt, locale) : "-";
      },
    },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-1 border-b">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton />
      {/* Main Tabs */}
      <div className="flex items-center gap-1 border-b">
        {mainTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setMainTab(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              mainTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {mainTab === "referral" ? (
        <ReferralTab settings={settings} />
      ) : (
        <>
          {/* Summary Cards */}
          {summary ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassSection>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("summary.total")}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(summary.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.totalCommissions} {t("summary.commissions")}
                </p>
              </GlassSection>

              <GlassSection>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("summary.pending")}
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary.pendingAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.pendingCommissions} {t("summary.commissions")}
                </p>
              </GlassSection>

              <GlassSection>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("summary.eligible")}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(summary.eligibleAmount || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.eligibleCommissions || 0} {t("summary.commissions")}
                </p>
              </GlassSection>

              <GlassSection>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("summary.paid")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.paidAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {summary.paidCommissions} {t("summary.commissions")}
                </p>
              </GlassSection>
            </div>
          ) : null}

          {/* Commission Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-1 border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
                    activeTab === tab.value
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/50",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <BaseTable
              columns={columns}
              data={filteredCommissions}
              showPagination={false}
              noResultsText={tCommon("noResults")}
            />
          </div>
        </>
      )}
    </div>
  );
}
