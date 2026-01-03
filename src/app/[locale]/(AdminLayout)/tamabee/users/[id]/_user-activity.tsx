"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils/format-date";
import type { SupportedLocale } from "@/lib/utils/format-currency";

interface ActivityItem {
  id: number;
  action: string;
  description: string;
  timestamp: string;
}

/**
 * Component hiển thị hoạt động gần đây của user
 * Hiện tại hiển thị placeholder vì API chưa có endpoint activity log
 */
export function UserActivity({ userId }: { userId: number }) {
  const t = useTranslations("users");
  const locale = useLocale() as SupportedLocale;
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      // API endpoint cho activity log chưa được implement
      // Khi có API, gọi: const response = await userApi.getActivities(userId);
      // setActivities(response.content);

      // Placeholder: không có activities
      void userId; // Sử dụng userId khi có API
      setActivities([]);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentActivity")}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("featureUpdating")}
          </p>
        ) : (
          <ul className="space-y-3">
            {activities.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-1">
                <span className="text-sm font-medium">{activity.action}</span>
                <span className="text-xs text-muted-foreground">
                  {activity.description}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(activity.timestamp, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
