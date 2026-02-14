"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { BaseTable } from "@/app/[locale]/_components/_base/base-table";
import { systemNotificationApi } from "@/lib/apis/system-notification-api";
import type { SystemNotification } from "@/types/system-notification";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { DEFAULT_PAGE_SIZE } from "@/types/api";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface NotificationTableProps {
  refreshTrigger?: number;
}

/**
 * Bảng danh sách system notifications với phân trang server-side
 */
export function NotificationTable({ refreshTrigger }: NotificationTableProps) {
  const t = useTranslations("systemNotifications");
  const tCommon = useTranslations("common");
  const tEnums = useTranslations("enums");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await systemNotificationApi.getAll(
          page,
          DEFAULT_PAGE_SIZE,
        );
        if (isMounted) {
          setNotifications(response.content);
          setTotalPages(response.totalPages);
          setTotalElements(response.totalElements);
        }
      } catch (error) {
        console.error("Failed to fetch system notifications:", error);
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [page, refreshTrigger]);

  /**
   * Lấy tiêu đề theo locale hiện tại
   */
  const getTitle = (notification: SystemNotification): string => {
    if (locale === "en") return notification.titleEn;
    if (locale === "ja") return notification.titleJa;
    return notification.titleVi;
  };

  const columns: ColumnDef<SystemNotification>[] = [
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
      id: "title",
      header: t("table.title"),
      cell: ({ row }) => (
        <span className="font-medium">{getTitle(row.original)}</span>
      ),
    },
    {
      accessorKey: "targetAudience",
      header: t("table.targetAudience"),
      cell: ({ row }) => (
        <span>
          {getEnumLabel("targetAudience", row.original.targetAudience, tEnums)}
        </span>
      ),
    },
    {
      accessorKey: "createdByName",
      header: t("table.createdBy"),
      cell: ({ row }) => <span>{row.getValue("createdByName") || "—"}</span>,
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

  const handleRowClick = (notification: SystemNotification) => {
    router.push(`/${locale}/admin/system-notifications/${notification.id}`);
  };

  return (
    <BaseTable
      columns={columns}
      data={notifications}
      noResultsText={tCommon("noResults")}
      onRowClick={handleRowClick}
      serverPagination={{
        page,
        totalPages,
        totalElements,
        onPageChange: setPage,
      }}
    />
  );
}
