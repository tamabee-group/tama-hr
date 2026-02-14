"use client";

import { useState, useEffect } from "react";
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";
import { FeedbackTable } from "./_feedback-table";

/**
 * Trang quản lý feedback (Tamabee Admin/Manager)
 * Danh sách feedbacks với lọc theo status/type và phân trang
 */
export default function AdminFeedbacksPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to real-time notifications để auto refresh khi có feedback mới
  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents("FEEDBACK", () => {
      setRefreshTrigger((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="space-y-6">
      <FeedbackTable refreshTrigger={refreshTrigger} />
    </div>
  );
}
