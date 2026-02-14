"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Skeleton } from "@/components/ui/skeleton";
import { referralApi } from "@/lib/apis/referral-api";
import { commissionApi } from "@/lib/apis/commission-api";
import { formatCurrency } from "@/lib/utils/format-currency";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { cn } from "@/lib/utils";
import type { ReferredCompany, CommissionSummary } from "@/types/referral";
import type { CommissionSettingsResponse } from "@/types/commission";
import type { CommissionStatus } from "@/types/enums";

/**
 * Nội dung trang Công ty giới thiệu cho SupportLayout
 * Hiển thị summary cards + bảng danh sách companies đã giới thiệu
 */
export function ReferralsPageContent() {
  const t = useTranslations("referrals");
  const tEnums = useTranslations("enums");

  const [companies, setCompanies] = useState<ReferredCompany[]>([]);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [, setSettings] = useState<CommissionSettingsResponse | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch summary + settings 1 lần khi mount
  useEffect(() => {
    async function fetchMeta() {
      try {
        const [summaryData, settingsData] = await Promise.all([
          referralApi.getCommissionSummary(),
          commissionApi.getMySettings(),
        ]);
        setSummary(summaryData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    }
    fetchMeta();
  }, []);

  // Fetch companies theo page
  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const response = await referralApi.getReferredCompanies(
        {},
        page,
        DEFAULT_PAGE_SIZE,
      );
      setCompanies(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Failed to fetch referrals:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const columns: ColumnDef<ReferredCompany>[] = [
    {
      id: "stt",
      header: "#",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * DEFAULT_PAGE_SIZE + row.index + 1}
        </span>
      ),
      size: 60,
    },
    {
      accessorKey: "companyName",
      header: t("table.companyName"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("companyName")}</span>
      ),
    },
    {
      accessorKey: "planName",
      header: t("table.plan"),
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              status === "ACTIVE"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
            )}
          >
            {t(`status.${status === "ACTIVE" ? "active" : "inactive"}`)}
          </span>
        );
      },
    },
    {
      accessorKey: "totalBilling",
      header: t("table.totalBilling"),
      cell: ({ row }) => formatCurrency(row.getValue("totalBilling")),
    },
    {
      accessorKey: "commissionStatus",
      header: t("table.commissionStatus"),
      cell: ({ row }) => {
        const status = row.getValue("commissionStatus") as CommissionStatus;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              status === "PENDING" &&
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
              status === "ELIGIBLE" &&
                "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
              status === "PAID" &&
                "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            )}
          >
            {getEnumLabel("commissionStatus", status, tEnums)}
          </span>
        );
      },
    },
  ];

  if (loading && companies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassSection>
            <p className="text-sm text-muted-foreground mb-1">
              {t("summary.totalReferrals")}
            </p>
            <p className="text-2xl font-bold">{summary.totalReferrals}</p>
          </GlassSection>
          <GlassSection>
            <p className="text-sm text-muted-foreground mb-1">
              {t("summary.pendingAmount")}
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {formatCurrency(summary.pendingAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.pendingCommissions} {t("summary.commissions")}
            </p>
          </GlassSection>
          <GlassSection>
            <p className="text-sm text-muted-foreground mb-1">
              {t("summary.eligibleAmount")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.eligibleAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.eligibleCommissions} {t("summary.commissions")}
            </p>
          </GlassSection>
          <GlassSection>
            <p className="text-sm text-muted-foreground mb-1">
              {t("summary.paidAmount")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.paidAmount)}
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.paidCommissions} {t("summary.commissions")}
            </p>
          </GlassSection>
        </div>
      )}

      {/* Bảng danh sách công ty */}
      <BaseTable
        columns={columns}
        data={companies}
        noResultsText={t("noCompanies")}
        serverPagination={{
          page,
          totalPages,
          totalElements,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
