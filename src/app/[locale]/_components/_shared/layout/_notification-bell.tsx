"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { BellIcon, CheckIcon, CheckCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatRelativeTime } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Types
// ============================================

export type NotificationType =
  | "adjustmentApproved"
  | "adjustmentRejected"
  | "leaveApproved"
  | "leaveRejected"
  | "salaryNotification"
  | "scheduleApproved"
  | "scheduleRejected"
  | "general";

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  /** URL để navigate khi click */
  link?: string;
  /** Metadata bổ sung */
  metadata?: Record<string, unknown>;
}

interface NotificationBellProps {
  /** Danh sách notifications */
  notifications: Notification[];
  /** Callback khi click vào notification */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback khi đánh dấu đã đọc */
  onMarkAsRead?: (notificationId: number) => void;
  /** Callback khi đánh dấu tất cả đã đọc */
  onMarkAllAsRead?: () => void;
  /** Custom className */
  className?: string;
  /** Số lượng notifications tối đa hiển thị */
  maxDisplay?: number;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Đếm số notifications chưa đọc
 * Export để sử dụng trong property test
 */
export function countUnreadNotifications(
  notifications: Notification[],
): number {
  return notifications.filter((n) => !n.isRead).length;
}

/**
 * Lấy icon cho notification type
 */
function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "adjustmentApproved":
    case "leaveApproved":
    case "scheduleApproved":
      return "✅";
    case "adjustmentRejected":
    case "leaveRejected":
    case "scheduleRejected":
      return "❌";
    case "salaryNotification":
      return "💰";
    default:
      return "📢";
  }
}

// ============================================
// NotificationBell Component
// ============================================

export function NotificationBell({
  notifications,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  className,
  maxDisplay = 10,
}: NotificationBellProps) {
  const t = useTranslations("notifications");
  const locale = useLocale() as SupportedLocale;
  const [open, setOpen] = React.useState(false);

  const unreadCount = countUnreadNotifications(notifications);
  const displayNotifications = notifications.slice(0, maxDisplay);
  const hasMore = notifications.length > maxDisplay;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={t("title")}
        >
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && <NotificationBadge count={unreadCount} />}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">{t("title")}</h3>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={onMarkAllAsRead}
            >
              <CheckCheckIcon className="h-3 w-3 mr-1" />
              {t("markAllRead")}
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {displayNotifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {t("empty")}
            </div>
          ) : (
            <div className="divide-y">
              {displayNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  locale={locale}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={
                    !notification.isRead && onMarkAsRead
                      ? () => onMarkAsRead(notification.id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasMore && (
          <div className="px-4 py-2 border-t text-center">
            <Button
              variant="link"
              size="sm"
              className="h-auto py-1 text-xs"
              onClick={() => setOpen(false)}
            >
              {t("viewAll")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// NotificationBadge Component
// ============================================

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  const displayCount = count > 99 ? "99+" : count.toString();

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 flex items-center justify-center",
        "min-w-[18px] h-[18px] px-1 rounded-full",
        "bg-red-500 text-white text-[10px] font-medium",
        className,
      )}
    >
      {displayCount}
    </span>
  );
}

// ============================================
// NotificationItem Component
// ============================================

interface NotificationItemProps {
  notification: Notification;
  locale: SupportedLocale;
  onClick: () => void;
  onMarkAsRead?: () => void;
}

function NotificationItem({
  notification,
  locale,
  onClick,
  onMarkAsRead,
}: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const timeAgo = formatRelativeTime(notification.createdAt, locale);

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors",
        "hover:bg-accent/50",
        !notification.isRead && "bg-accent/30",
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick();
        }
      }}
    >
      {/* Icon */}
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm line-clamp-1",
            !notification.isRead && "font-medium",
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>

      {/* Mark as read button */}
      {onMarkAsRead && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead();
          }}
          aria-label="Mark as read"
        >
          <CheckIcon className="h-3 w-3" />
        </Button>
      )}

      {/* Unread indicator */}
      {!notification.isRead && !onMarkAsRead && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </div>
  );
}
