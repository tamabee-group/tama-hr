"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NotificationTable } from "./_notification-table";
import { NotificationDialog } from "./_notification-dialog";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";

/**
 * Trang quản lý thông báo hệ thống (Tamabee Admin/Manager)
 * - Danh sách system notifications với phân trang
 * - Dialog tạo notification mới
 */
export default function SystemNotificationsPage() {
  const t = useTranslations("systemNotifications");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setDialogOpen(false);
  };

  // Subscribe to real-time notifications để auto refresh khi có system notification mới
  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("SYSTEM", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("create")}
        </Button>
      </div>

      <NotificationTable refreshTrigger={refreshTrigger} />

      <NotificationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
