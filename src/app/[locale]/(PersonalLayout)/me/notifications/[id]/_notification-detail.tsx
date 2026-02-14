"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GlassSection } from "@/app/[locale]/_components/_glass-style";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { MarkdownRenderer } from "@/app/[locale]/_components/_shared/_markdown-renderer";

import { notificationApi } from "@/lib/apis/notification-api";
import { systemNotificationApi } from "@/lib/apis/system-notification-api";
import type { SystemNotificationDetail as SystemNotifDetail } from "@/lib/apis/system-notification-api";
import { formatDateTime } from "@/lib/utils/format-date-time";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import type { Notification } from "@/types/notification";
import type { SupportedLocale } from "@/lib/utils/format-currency";

// ============================================
// Constants — Welcome notification codes
// ============================================

const WELCOME_CODES = ["WELCOME_COMPANY", "WELCOME_EMPLOYEE"] as const;

// ============================================
// Helpers
// ============================================

/**
 * Kiểm tra notification có phải welcome notification không
 */
function isWelcomeNotification(code: string): boolean {
  return WELCOME_CODES.includes(code as (typeof WELCOME_CODES)[number]);
}

/**
 * Lấy nội dung welcome từ i18n template (help.json)
 */
function getWelcomeContent(
  code: string,
  tHelp: (key: string) => string,
): { title: string; content: string } | null {
  if (code === "WELCOME_COMPANY") {
    return {
      title: tHelp("welcome.companyTitle"),
      content: tHelp("welcome.companyContent"),
    };
  }
  if (code === "WELCOME_EMPLOYEE") {
    return {
      title: tHelp("welcome.employeeTitle"),
      content: tHelp("welcome.employeeContent"),
    };
  }
  return null;
}

/**
 * Lấy title và content theo locale từ system notification
 */
function getLocalizedContent(
  sysNotif: SystemNotifDetail,
  locale: string,
): { title: string; content: string } {
  const localeMap: Record<string, { title: string; content: string }> = {
    vi: { title: sysNotif.titleVi, content: sysNotif.contentVi },
    en: { title: sysNotif.titleEn, content: sysNotif.contentEn },
    ja: { title: sysNotif.titleJa, content: sysNotif.contentJa },
  };
  return localeMap[locale] || localeMap.vi;
}

// ============================================
// Skeleton Component
// ============================================

function DetailSkeleton() {
  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <Skeleton className="h-8 w-24 rounded-full" />
      <GlassSection>
        <div className="space-y-4 p-6">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </GlassSection>
    </div>
  );
}

// ============================================
// Error State Component
// ============================================

function NotFoundState({
  t,
  onBack,
}: {
  t: ReturnType<typeof useTranslations<"notifications">>;
  onBack: () => void;
}) {
  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <BackButton />
      <GlassSection>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t("detail.notFound")}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("detail.notFoundDescription")}
          </p>
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("detail.backToList")}
          </Button>
        </div>
      </GlassSection>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

interface NotificationDetailProps {
  notificationId: number;
}

export function NotificationDetail({
  notificationId,
}: NotificationDetailProps) {
  const t = useTranslations("notifications");
  const tHelp = useTranslations("help");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const locale = useLocale();

  const [notification, setNotification] = React.useState<Notification | null>(
    null,
  );
  const [displayTitle, setDisplayTitle] = React.useState("");
  const [displayContent, setDisplayContent] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // Fetch notification detail và xử lý logic hiển thị
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setNotFound(false);

        // Fetch notification detail
        const notif = await notificationApi.getNotificationById(notificationId);
        setNotification(notif);

        // Đánh dấu đã đọc nếu chưa đọc
        if (!notif.isRead) {
          notificationApi.markAsRead(notificationId).catch(() => {});
        }

        // Xử lý logic hiển thị nội dung
        if (isWelcomeNotification(notif.code)) {
          // Welcome notification → render từ i18n template
          const welcome = getWelcomeContent(notif.code, tHelp);
          if (welcome) {
            setDisplayTitle(welcome.title);
            setDisplayContent(welcome.content);
          }
        } else if (notif.systemNotificationId) {
          // System notification → fetch nội dung đa ngôn ngữ
          try {
            const sysNotif = await systemNotificationApi.getById(
              notif.systemNotificationId,
            );
            const localized = getLocalizedContent(sysNotif, locale);
            setDisplayTitle(localized.title);
            setDisplayContent(localized.content);
          } catch {
            // Fallback về title/content từ notification
            setDisplayTitle(notif.title || "");
            setDisplayContent(notif.content || "");
          }
        } else {
          // Notification thường → hiển thị title + content từ DB
          setDisplayTitle(notif.title || "");
          setDisplayContent(notif.content || "");
        }
      } catch (error) {
        const errorCode = (error as { errorCode?: string }).errorCode;
        if (
          errorCode === "NOTIFICATION_NOT_FOUND" ||
          errorCode === "FORBIDDEN" ||
          (error as { status?: number }).status === 404 ||
          (error as { status?: number }).status === 403
        ) {
          setNotFound(true);
        } else {
          toast.error(getErrorMessage((error as Error).message, tErrors));
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [notificationId, locale, tHelp, tErrors]);

  // Cập nhật nội dung khi locale thay đổi (cho welcome notification)
  React.useEffect(() => {
    if (!notification) return;

    if (isWelcomeNotification(notification.code)) {
      const welcome = getWelcomeContent(notification.code, tHelp);
      if (welcome) {
        setDisplayTitle(welcome.title);
        setDisplayContent(welcome.content);
      }
    }
  }, [locale, notification, tHelp]);

  const handleBackToList = React.useCallback(() => {
    router.push(`/${locale}/me/notifications`);
  }, [router, locale]);

  // Loading state
  if (loading) {
    return <DetailSkeleton />;
  }

  // Error state
  if (notFound || !notification) {
    return <NotFoundState t={t} onBack={handleBackToList} />;
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <BackButton />

      <GlassSection>
        <div className="p-6 space-y-4">
          {/* Tiêu đề */}
          {displayTitle && (
            <h1 className="text-xl font-semibold leading-tight">
              {displayTitle}
            </h1>
          )}

          {/* Thời gian tạo */}
          <p className="text-sm text-muted-foreground">
            {formatDateTime(notification.createdAt, locale as SupportedLocale)}
          </p>

          {/* Nội dung Markdown */}
          {displayContent && (
            <div className="pt-2 border-t">
              <MarkdownRenderer content={displayContent} />
            </div>
          )}
        </div>
      </GlassSection>
    </div>
  );
}
