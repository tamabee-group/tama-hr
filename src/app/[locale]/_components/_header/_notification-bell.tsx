"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/use-notifications";
import {
  translateNotification,
  formatNotificationTime,
} from "@/lib/utils/notification";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import type { SupportedLocale } from "@/lib/utils/format-currency";

/**
 * Component hiển thị badge số lượng thông báo chưa đọc
 * - Không hiển thị khi count = 0
 * - Hiển thị "99+" khi count > 99
 */
function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span className="absolute top-0 left-[60%] flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[12px] font-medium text-white leading-none whitespace-nowrap">
      {displayCount}
    </span>
  );
}

/**
 * Component hiển thị một notification item trong popup
 */
function NotificationItem({
  notification,
  onClick,
  t,
  locale,
}: {
  notification: Notification;
  onClick: (notification: Notification) => void;
  t: ReturnType<typeof useTranslations<"notifications">>;
  locale: SupportedLocale;
}) {
  const message = translateNotification(
    notification.code,
    notification.params,
    t,
    locale,
  );
  const timeAgo = formatNotificationTime(notification.createdAt, t);

  return (
    <button
      onClick={() => onClick(notification)}
      className={cn(
        "w-full text-left px-3 py-2 rounded-md transition-colors hover:bg-accent cursor-pointer",
        !notification.isRead && "bg-primary/5",
      )}
    >
      <p
        className={cn(
          "text-sm line-clamp-3",
          notification.isRead
            ? "text-muted-foreground"
            : "text-foreground font-medium",
        )}
      >
        {message}
      </p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
        {!notification.isRead && (
          <span className="text-xs font-medium text-primary">
            {t("unread")}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Component hiển thị trạng thái rỗng khi không có thông báo
 */
function EmptyState({
  t,
}: {
  t: ReturnType<typeof useTranslations<"notifications">>;
}) {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
      <p className="text-sm">{t("noNotifications")}</p>
    </div>
  );
}

/**
 * NotificationBell - Component chuông thông báo trong header
 * - Hiển thị icon chuông với badge số lượng chưa đọc
 * - Popup hiển thị 5 thông báo gần nhất khi click
 * - Link "Xem tất cả" đến trang /me/notifications
 * - Click vào notification để điều hướng và đánh dấu đã đọc
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("notifications");

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  /**
   * Xử lý khi click vào một notification
   * - Đánh dấu đã đọc
   * - Điều hướng đến targetUrl hoặc /me/notifications nếu không có
   */
  const handleNotificationClick = async (notification: Notification) => {
    // Đóng popup
    setOpen(false);

    // Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Welcome notification → mở trang detail để hiển thị nội dung đầy đủ
    if (
      notification.code === "WELCOME_COMPANY" ||
      notification.code === "WELCOME_EMPLOYEE"
    ) {
      router.push(`/${locale}/me/notifications/${notification.id}`);
      return;
    }

    // Điều hướng đến targetUrl hoặc fallback về trang notifications
    const targetUrl = notification.targetUrl || "/me/notifications";
    router.push(`/${locale}${targetUrl}`);
  };

  /**
   * Xử lý đánh dấu tất cả đã đọc
   */
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative top-0.5 mr-4 p-2 rounded-full hover:bg-accent transition-colors cursor-pointer"
          aria-label={t("title")}
        >
          <Bell
            className={cn(
              "h-[26px] w-[26px] transition-transform",
              unreadCount > 0 && "animate-bell-shake",
            )}
          />
          <UnreadBadge count={unreadCount} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 max-md:w-[calc(100vw-2rem)] max-md:max-w-[400px]"
        collisionPadding={16}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-semibold">{t("title")}</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-primary hover:text-primary"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              {t("markAllRead")}
            </Button>
          )}
        </div>

        <Separator />

        {/* Danh sách notifications */}
        <div className="max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            <div className="p-1 space-y-1">
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={`${notification.id}-${index}`}
                  notification={notification}
                  onClick={handleNotificationClick}
                  t={t}
                  locale={locale as SupportedLocale}
                />
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Footer - View All link */}
        <div className="p-2">
          <Link
            href={`/${locale}/me/notifications`}
            onClick={() => setOpen(false)}
            className="block w-full text-center py-2 text-sm text-primary hover:bg-accent rounded-md transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
