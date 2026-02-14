"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { feedbackApi } from "@/lib/apis/feedback-api";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Feedback, FeedbackType, FeedbackStatus } from "@/types/feedback";
import { FEEDBACK_TYPES, FEEDBACK_STATUSES } from "@/types/feedback";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// Màu badge theo status
const STATUS_BADGE_CLASSES: Record<FeedbackStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  IN_PROGRESS:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  RESOLVED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

// Màu badge theo type
const TYPE_BADGE_CLASSES: Record<FeedbackType, string> = {
  BUG_REPORT: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  FEATURE_REQUEST:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  GENERAL_FEEDBACK:
    "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  SUPPORT_REQUEST:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

interface FeedbackTableProps {
  refreshTrigger?: number;
}

/**
 * Bảng danh sách feedbacks cho admin với lọc và phân trang server-side
 */
export function FeedbackTable({ refreshTrigger }: FeedbackTableProps) {
  const t = useTranslations("adminFeedbacks");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    FeedbackStatus | undefined
  >();
  const [typeFilter, setTypeFilter] = useState<FeedbackType | undefined>();

  const fetchFeedbacks = useCallback(async () => {
    try {
      const response = await feedbackApi.getAdminFeedbacks(
        page,
        DEFAULT_PAGE_SIZE,
        statusFilter,
        typeFilter,
      );
      setFeedbacks(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Refetch khi refreshTrigger thay đổi
  useEffect(() => {
    if (refreshTrigger) {
      fetchFeedbacks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  // Reset page khi thay đổi filter
  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "ALL" ? undefined : (value as FeedbackStatus));
    setPage(0);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value === "ALL" ? undefined : (value as FeedbackType));
    setPage(0);
  };

  const columns: ColumnDef<Feedback>[] = [
    {
      id: "stt",
      header: t("table.stt"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {page * DEFAULT_PAGE_SIZE + row.index + 1}
        </span>
      ),
      size: 60,
    },
    {
      accessorKey: "type",
      header: t("table.type"),
      cell: ({ row }) => {
        const type = row.getValue("type") as FeedbackType;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              TYPE_BADGE_CLASSES[type],
            )}
          >
            {getEnumLabel("feedbackType", type, tEnums)}
          </span>
        );
      },
    },
    {
      accessorKey: "title",
      header: t("table.feedbackTitle"),
      cell: ({ row }) => (
        <span className="font-medium line-clamp-1">
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "userName",
      header: t("table.sender"),
      cell: ({ row }) => <span>{row.getValue("userName")}</span>,
    },
    {
      accessorKey: "companyName",
      header: t("table.company"),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.getValue("companyName") || "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const status = row.getValue("status") as FeedbackStatus;
        return (
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              STATUS_BADGE_CLASSES[status],
            )}
          >
            {getEnumLabel("feedbackStatus", status, tEnums)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t("table.createdAt"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(row.getValue("createdAt"), locale)}
        </span>
      ),
    },
  ];

  const handleRowClick = (feedback: Feedback) => {
    router.push(`/${locale}/admin/feedbacks/${feedback.id}`);
  };

  return (
    <div className="space-y-4">
      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter || "ALL"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filter.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filter.allStatuses")}</SelectItem>
            {FEEDBACK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {getEnumLabel("feedbackStatus", status, tEnums)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter || "ALL"} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("filter.allTypes")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("filter.allTypes")}</SelectItem>
            {FEEDBACK_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {getEnumLabel("feedbackType", type, tEnums)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <BaseTable
        columns={columns}
        data={feedbacks}
        noResultsText={tCommon("noResults")}
        onRowClick={handleRowClick}
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
