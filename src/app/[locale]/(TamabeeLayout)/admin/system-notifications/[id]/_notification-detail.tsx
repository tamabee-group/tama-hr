"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";
import { GlassTabs } from "@/app/[locale]/_components/_glass-style";
import { MarkdownRenderer } from "@/app/[locale]/_components/_shared/_markdown-renderer";
import { systemNotificationApi } from "@/lib/apis/system-notification-api";
import type { SystemNotification } from "@/types/system-notification";
import { getEnumLabel } from "@/lib/utils/get-enum-label";
import { formatDateTime } from "@/lib/utils/format-date-time";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface SystemNotificationDetailProps {
  notificationId: number;
}

/**
 * Chi tiết system notification — hiển thị nội dung 3 ngôn ngữ với tabs chuyển đổi
 */
export function SystemNotificationDetail({
  notificationId,
}: SystemNotificationDetailProps) {
  const t = useTranslations("systemNotifications");
  const tEnums = useTranslations("enums");
  const params = useParams();
  const locale = (params.locale as SupportedLocale) || "vi";

  const [notification, setNotification] = useState<SystemNotification | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState<string>(locale);

  useEffect(() => {
    let isMounted = true;

    const loadNotification = async () => {
      try {
        const data = await systemNotificationApi.getById(notificationId);
        if (isMounted) setNotification(data);
      } catch (error) {
        console.error("Failed to fetch system notification:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadNotification();
    return () => {
      isMounted = false;
    };
  }, [notificationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="space-y-4">
        <BackButton />
        <p className="text-muted-foreground text-center py-8">
          {t("detail.title")}
        </p>
      </div>
    );
  }

  // Lấy title/content theo ngôn ngữ đang chọn
  const getTitle = () => {
    if (activeLang === "en") return notification.titleEn;
    if (activeLang === "ja") return notification.titleJa;
    return notification.titleVi;
  };

  const getContent = () => {
    if (activeLang === "en") return notification.contentEn;
    if (activeLang === "ja") return notification.contentJa;
    return notification.contentVi;
  };

  const langTabs = [
    { value: "vi", label: t("detail.tabVi") },
    { value: "en", label: t("detail.tabEn") },
    { value: "ja", label: t("detail.tabJa") },
  ];

  return (
    <div className="space-y-4">
      <BackButton />

      {/* Thông tin meta */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>
          {t("detail.targetAudience")}:{" "}
          <span className="font-medium text-foreground">
            {getEnumLabel(
              "targetAudience",
              notification.targetAudience,
              tEnums,
            )}
          </span>
        </span>
        {notification.createdByName && (
          <span>
            {t("detail.createdBy")}:{" "}
            <span className="font-medium text-foreground">
              {notification.createdByName}
            </span>
          </span>
        )}
        <span>
          {t("detail.createdAt")}:{" "}
          <span className="font-medium text-foreground">
            {formatDateTime(notification.createdAt, locale)}
          </span>
        </span>
      </div>

      {/* Tabs chuyển đổi ngôn ngữ */}
      <GlassTabs tabs={langTabs} value={activeLang} onChange={setActiveLang} />

      {/* Nội dung Markdown */}
      <div className="rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">{getTitle()}</h2>
        <MarkdownRenderer content={getContent()} />
      </div>
    </div>
  );
}
