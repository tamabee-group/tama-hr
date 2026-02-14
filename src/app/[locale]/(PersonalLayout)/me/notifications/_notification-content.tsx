"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Loader2,
  PartyPopper,
  Wallet,
  CalendarDays,
  ClipboardEdit,
  Settings,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/app/[locale]/_components/_base/_pagination";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassCard } from "@/app/[locale]/_components/_glass-style";

import { notificationApi } from "@/lib/apis/notification-api";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import {
  translateNotification,
  formatNotificationTime,
} from "@/lib/utils/notification";
import { Notification, NotificationType } from "@/types/notification";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Constants
// ============================================

const DEFAULT_PAGE_SIZE = 10;

// Icon và màu sắc theo notification type
const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  {
    icon: React.ElementType;
    bgColor: string;
    iconColor: string;
  }
> = {
  WELCOME: {
    icon: PartyPopper,
    bgColor: "bg-purple-100 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  PAYROLL: {
    icon: Banknote,
    bgColor: "bg-green-100 dark:bg-green-500/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  WALLET: {
    icon: Wallet,
    bgColor: "bg-amber-100 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  LEAVE: {
    icon: CalendarDays,
    bgColor: "bg-blue-100 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  ADJUSTMENT: {
    icon: ClipboardEdit,
    bgColor: "bg-orange-100 dark:bg-orange-500/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  SYSTEM: {
    icon: Settings,
    bgColor: "bg-gray-100 dark:bg-gray-500/20",
    iconColor: "text-gray-600 dark:text-gray-400",
  },
  FEEDBACK: {
    icon: Bell,
    bgColor: "bg-teal-100 dark:bg-teal-500/20",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
};

// ============================================
// Types
// ============================================

interface PaginationState {
  page: number;
  totalPages: number;
  totalElements: number;
}

// ============================================
// Skeleton Component
// ============================================

function NotificationListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-3xl" />
      ))}
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

function NotificationEmptyState({ message }: { message: string }) {
  return (
    <GlassCard className="p-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="rounded-full bg-muted/50 p-4 mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </GlassCard>
  );
}

// ============================================
// Notification Item Component
// ============================================

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  t: ReturnType<typeof useTranslations<"notifications">>;
  locale: SupportedLocale;
}

function NotificationItem({
  notification,
  onClick,
  t,
  locale,
}: NotificationItemProps) {
  // Dịch message từ code và params
  const message = translateNotification(
    notification.code,
    notification.params,
    t,
    locale,
  );

  // Format thời gian tương đối
  const timeAgo = formatNotificationTime(notification.createdAt, t);

  // Lấy config theo type
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type];
  const IconComponent = typeConfig.icon;

  return (
    <GlassCard
      variant="interactive"
      onClick={() => onClick(notification)}
      className={cn(
        "p-4 text-left w-full",
        // Phân biệt read/unread
        notification.isRead && "opacity-60 bg-white/40 dark:bg-white/5",
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon theo type */}
        <div
          className={cn(
            "shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
            typeConfig.bgColor,
          )}
        >
          <IconComponent className={cn("h-5 w-5", typeConfig.iconColor)} />
        </div>

        {/* Nội dung */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm leading-relaxed",
              notification.isRead
                ? "text-muted-foreground"
                : "text-foreground font-medium",
            )}
          >
            {message}
          </p>

          {/* Thời gian và trạng thái chưa đọc */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {!notification.isRead && (
              <span className="text-xs font-medium text-primary">
                {t("unread")}
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

// ============================================
// Main Component
// ============================================

export function NotificationContent() {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const locale = useLocale();

  // State
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [markingAllRead, setMarkingAllRead] = React.useState(false);
  const [pagination, setPagination] = React.useState<PaginationState>({
    page: 0,
    totalPages: 0,
    totalElements: 0,
  });

  // Tính số lượng unread trong danh sách hiện tại
  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  // Fetch notifications
  const fetchNotifications = React.useCallback(
    async (page: number) => {
      try {
        setLoading(true);
        const response = await notificationApi.getNotifications(
          page,
          DEFAULT_PAGE_SIZE,
        );
        setNotifications(response.content);
        setPagination({
          page: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
        });
      } catch (error) {
        toast.error(getErrorMessage((error as Error).message, tErrors));
      } finally {
        setLoading(false);
      }
    },
    [tErrors],
  );

  // Initial fetch
  React.useEffect(() => {
    fetchNotifications(0);
  }, [fetchNotifications]);

  // Subscribe to real-time notifications để auto refresh khi có notification mới
  React.useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("*", () => {
      // Refetch trang hiện tại khi có notification mới
      fetchNotifications(pagination.page);
    });
    return unsubscribe;
  }, [fetchNotifications, pagination.page]);

  // Xử lý click vào notification
  const handleNotificationClick = React.useCallback(
    async (notification: Notification) => {
      // Đánh dấu đã đọc nếu chưa đọc
      if (!notification.isRead) {
        try {
          await notificationApi.markAsRead(notification.id);
          // Cập nhật state local
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, isRead: true } : n,
            ),
          );
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      }

      // Welcome notification → mở trang detail để hiển thị nội dung đầy đủ
      if (
        notification.code === "WELCOME_COMPANY" ||
        notification.code === "WELCOME_EMPLOYEE"
      ) {
        router.push(`/${locale}/me/notifications/${notification.id}`);
        return;
      }

      // Navigate đến targetUrl hoặc fallback về trang detail
      const targetUrl = notification.targetUrl;
      if (targetUrl && targetUrl.trim() !== "") {
        router.push(`/${locale}${targetUrl}`);
      }
    },
    [router, locale],
  );

  // Xử lý đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = React.useCallback(async () => {
    try {
      setMarkingAllRead(true);
      await notificationApi.markAllAsRead();
      // Cập nhật state local
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(t("markAllRead"));
    } catch (error) {
      toast.error(getErrorMessage((error as Error).message, tErrors));
    } finally {
      setMarkingAllRead(false);
    }
  }, [t, tErrors]);

  // Xử lý thay đổi trang
  const handlePageChange = React.useCallback(
    (newPage: number) => {
      fetchNotifications(newPage);
    },
    [fetchNotifications],
  );

  // Loading state ban đầu
  if (loading && notifications.length === 0) {
    return (
      <div className="max-w-[700px] mx-auto space-y-4">
        <BackButton />
        <NotificationListSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      {/* Nút quay lại */}
      <BackButton />

      {/* Header với nút Mark All as Read */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="gap-2 rounded-full"
          >
            {markingAllRead ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            {t("markAllRead")}
          </Button>
        </div>
      )}

      {/* Loading overlay khi đang fetch */}
      {loading && notifications.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <NotificationEmptyState message={t("noNotifications")} />
      )}

      {/* Danh sách notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
              t={t}
              locale={locale as SupportedLocale}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            previousText={tCommon("previous")}
            nextText={tCommon("next")}
          />
        </div>
      )}
    </div>
  );
}
