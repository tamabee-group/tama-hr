"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import {
  CommissionResponse,
  CommissionSummaryResponse,
  CommissionFilterRequest,
} from "@/types/commission";
import { commissionApi } from "@/lib/apis/commission-api";
import { formatCurrency, SupportedLocale } from "@/lib/utils/format-currency";
import { CommissionStatus } from "@/types/enums";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils/format-date";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { useLocale } from "next-intl";

type TabStatus = "ALL" | CommissionStatus;

/**
 * Client component chứa state và logic cho trang hoa hồng của Employee
 */
export function EmployeeCommissionsPageContent() {
  const t = useTranslations("commissions");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;

  const [commissions, setCommissions] = useState<CommissionResponse[]>([]);
  const [summary, setSummary] = useState<CommissionSummaryResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("ALL");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const tabs: { value: TabStatus; label: string }[] = [
    { value: "ALL", label: t("tabs.all") },
    { value: "PENDING", label: t("tabs.pending") },
    { value: "ELIGIBLE", label: t("tabs.eligible") },
    { value: "PAID", label: t("tabs.paid") },
  ];

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const filter: CommissionFilterRequest = {};
      if (activeTab !== "ALL") {
        filter.status = activeTab;
      }

      const response = await commissionApi.getMyCommissions(
        filter,
        page,
        DEFAULT_PAGE_SIZE,
      );
      setCommissions(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch commissions:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await commissionApi.getMySummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

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
          {formatCurrency(row.getValue("amount"), locale)}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("myCommissions")}</h1>
        <p className="text-muted-foreground">{t("myDescription")}</p>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("summary.total")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.totalAmount, locale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.totalCommissions} {t("summary.commissions")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("summary.pending")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summary.pendingAmount, locale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.pendingCommissions} {t("summary.commissions")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("summary.eligible")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.eligibleAmount || 0, locale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.eligibleCommissions || 0} {t("summary.commissions")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("summary.paid")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.paidAmount, locale)}
              </p>
              <p className="text-xs text-muted-foreground">
                {summary.paidCommissions} {t("summary.commissions")}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Commission Table */}
      {loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      ) : (
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
            data={commissions}
            showPagination={false}
            noResultsText={tCommon("noResults")}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                {tCommon("previous")}
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                {tCommon("next")}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
