---
name: Frontend Notifications
description: Frontend notification system - real-time subscriptions, useNotifications hook, notification types and translation
---

# Notifications System (Frontend)

## Real-time Refresh khi có Notification

Sử dụng `subscribeToNotificationEvents` để auto-refresh data khi có notification mới:

```typescript
import { subscribeToNotificationEvents } from "@/hooks/use-notifications";

useEffect(() => {
  const unsubscribe = subscribeToNotificationEvents("LEAVE", () => {
    fetchData(); // Refresh data khi có notification type LEAVE
  });
  return unsubscribe;
}, [fetchData]);
```

### Subscribe Options

```typescript
// Subscribe theo notification type
subscribeToNotificationEvents("LEAVE", callback); // LEAVE_SUBMITTED, LEAVE_APPROVED, LEAVE_REJECTED
subscribeToNotificationEvents("ADJUSTMENT", callback); // ADJUSTMENT_*
subscribeToNotificationEvents("WALLET", callback); // DEPOSIT_*
subscribeToNotificationEvents("PAYROLL", callback); // PAYROLL_*

// Subscribe theo exact code
subscribeToNotificationEvents("LEAVE_APPROVED", callback);

// Subscribe tất cả notifications
subscribeToNotificationEvents("*", callback);
```

## Hook useNotifications

```typescript
const {
  notifications, // Notification[] - 5 notifications mới nhất cho popup
  unreadCount, // number - Số chưa đọc
  isLoading, // boolean
  isConnected, // boolean - WebSocket connected
  markAsRead, // (id: number) => Promise<void>
  markAllAsRead, // () => Promise<void>
  refetch, // () => Promise<void>
} = useNotifications();
```

## Notification Types

| Type       | Codes                                                          | Trang cần subscribe                         |
| ---------- | -------------------------------------------------------------- | ------------------------------------------- |
| LEAVE      | LEAVE_SUBMITTED, LEAVE_APPROVED, LEAVE_REJECTED                | `/me/leave`, `/dashboard/leaves`            |
| ADJUSTMENT | ADJUSTMENT_SUBMITTED, ADJUSTMENT_APPROVED, ADJUSTMENT_REJECTED | `/me/adjustments`, `/dashboard/adjustments` |
| WALLET     | DEPOSIT_SUBMITTED, DEPOSIT_APPROVED, DEPOSIT_REJECTED          | `/dashboard/wallet`, `/admin/deposits`      |
| PAYROLL    | PAYROLL_CONFIRMED, PAYROLL_PAID                                | `/me/payroll`                               |
| SYSTEM     | SYSTEM_ANNOUNCEMENT                                            | `/me/notifications`                         |
| FEEDBACK   | FEEDBACK_SUBMITTED, FEEDBACK_REPLIED                           | `/admin/feedbacks`, `/me/help/feedbacks`    |

## Translation

Notification messages được định nghĩa trong `messages/{locale}/notifications.json`:

```json
{
  "codes": {
    "LEAVE_APPROVED": "Đơn xin nghỉ phép từ {startDate} đến {endDate} đã được duyệt",
    "DEPOSIT_SUBMITTED": "{companyName} đã gửi yêu cầu nạp tiền {amount}"
  }
}
```

Sử dụng `translateNotification()` từ `@/lib/utils/notification` để dịch:

```typescript
import { translateNotification } from "@/lib/utils/notification";

const message = translateNotification(
  notification.code,
  notification.params,
  t,
);
```
