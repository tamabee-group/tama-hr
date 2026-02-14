"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MessageSquareOff } from "lucide-react";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { Skeleton } from "@/components/ui/skeleton";
import { feedbackApi } from "@/lib/apis/feedback-api";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import type { Feedback, FeedbackType, FeedbackStatus } from "@/types/feedback";
import { cn } from "@/lib/utils";
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

/**
 * Danh sách feedback đã gửi của user
 * Hiển thị: loại, tiêu đề, trạng thái, thời gian tạo
 */
export function FeedbackList() {
  const t = useTranslations("help.feedback");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const locale = useLocale() as SupportedLocale;
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchFeedbacks = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const data = await feedbackApi.getMyFeedbacks(pageNum, 20);
      setFeedbacks(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      // Lỗi sẽ được xử lý bởi apiClient
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks(page);
  }, [page, fetchFeedbacks]);

  // Subscribe to real-time notifications để auto refresh khi có phản hồi mới
  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("FEEDBACK", () => {
      fetchFeedbacks(page);
    });
    return unsubscribe;
  }, [fetchFeedbacks, page]);

  const columns: ColumnDef<Feedback>[] = [
    {
      accessorKey: "type",
      header: t("type"),
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
      header: t("titleLabel"),
      cell: ({ row }) => (
        <span className="font-medium line-clamp-1">
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: t("status"),
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
      header: t("createdAt"),
      cell: ({ row }) => formatDateTime(row.getValue("createdAt"), locale),
    },
  ];

  // Loading skeleton
  if (loading && feedbacks.length === 0) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton />

      {feedbacks.length === 0 && !loading ? (
        <GlassSection>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <MessageSquareOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t("empty")}</h3>
            <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
          </div>
        </GlassSection>
      ) : (
        <BaseTable
          columns={columns}
          data={feedbacks}
          noResultsText={tCommon("noResults")}
          onRowClick={(row) => router.push(`/me/help/feedbacks/${row.id}`)}
          serverPagination={{
            page,
            totalPages,
            totalElements,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
