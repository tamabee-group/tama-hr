import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  countUnreadNotifications,
  Notification,
  NotificationType,
} from "@/app/[locale]/_components/_shared/_notification-bell";

/**
 * Property-Based Tests cho NotificationBell Component
 * Feature: attendance-payroll-frontend
 */

// Arbitrary cho NotificationType
const notificationTypeArb = fc.constantFrom<NotificationType>(
  "adjustmentApproved",
  "adjustmentRejected",
  "leaveApproved",
  "leaveRejected",
  "salaryNotification",
  "scheduleApproved",
  "scheduleRejected",
  "general",
);

// Arbitrary cho ISO date string (tránh invalid date)
const isoDateArb = fc
  .integer({ min: 1577836800000, max: 1924905600000 }) // 2020-01-01 to 2030-12-31
  .map((timestamp) => new Date(timestamp).toISOString());

// Factory function để tạo notification arbitrary với isRead cố định
function createNotificationArb(isReadValue?: boolean) {
  return fc.record({
    id: fc.nat(),
    type: notificationTypeArb,
    title: fc.string({ minLength: 1, maxLength: 100 }),
    message: fc.string({ minLength: 1, maxLength: 500 }),
    isRead: isReadValue !== undefined ? fc.constant(isReadValue) : fc.boolean(),
    createdAt: isoDateArb,
    link: fc.option(fc.constant("https://example.com"), { nil: undefined }),
  }) as fc.Arbitrary<Notification>;
}

// Arbitrary cho danh sách notifications
const notificationsArb = fc.array(createNotificationArb(), {
  minLength: 0,
  maxLength: 50,
});

// Arbitrary cho danh sách notifications đã đọc
const allReadNotificationsArb = fc.array(createNotificationArb(true), {
  minLength: 0,
  maxLength: 50,
});

// Arbitrary cho danh sách notifications chưa đọc
const allUnreadNotificationsArb = fc.array(createNotificationArb(false), {
  minLength: 0,
  maxLength: 50,
});

// Arbitrary cho danh sách notifications chưa đọc (ít nhất 1)
const atLeastOneUnreadArb = fc.array(createNotificationArb(false), {
  minLength: 1,
  maxLength: 50,
});

describe("NotificationBell - Property Tests", () => {
  /**
   * Property 6: Notification Count Accuracy
   *
   * Với bất kỳ danh sách notifications nào, số lượng unread count
   * PHẢI bằng số lượng notifications có isRead = false
   */
  describe("Property 6: Notification Count Accuracy", () => {
    it("unread count phải bằng số notifications có isRead = false", () => {
      fc.assert(
        fc.property(notificationsArb, (notifications) => {
          const unreadCount = countUnreadNotifications(notifications);
          const expectedCount = notifications.filter((n) => !n.isRead).length;

          expect(unreadCount).toBe(expectedCount);
        }),
        { numRuns: 100 },
      );
    });

    it("unread count phải là 0 khi tất cả notifications đã đọc", () => {
      fc.assert(
        fc.property(allReadNotificationsArb, (notifications) => {
          const unreadCount = countUnreadNotifications(notifications);
          expect(unreadCount).toBe(0);
        }),
        { numRuns: 100 },
      );
    });

    it("unread count phải bằng tổng số khi tất cả notifications chưa đọc", () => {
      fc.assert(
        fc.property(allUnreadNotificationsArb, (notifications) => {
          const unreadCount = countUnreadNotifications(notifications);
          expect(unreadCount).toBe(notifications.length);
        }),
        { numRuns: 100 },
      );
    });

    it("unread count phải là 0 khi danh sách rỗng", () => {
      const unreadCount = countUnreadNotifications([]);
      expect(unreadCount).toBe(0);
    });

    it("unread count phải không âm", () => {
      fc.assert(
        fc.property(notificationsArb, (notifications) => {
          const unreadCount = countUnreadNotifications(notifications);
          expect(unreadCount).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 100 },
      );
    });

    it("unread count phải không vượt quá tổng số notifications", () => {
      fc.assert(
        fc.property(notificationsArb, (notifications) => {
          const unreadCount = countUnreadNotifications(notifications);
          expect(unreadCount).toBeLessThanOrEqual(notifications.length);
        }),
        { numRuns: 100 },
      );
    });

    it("đánh dấu một notification đã đọc phải giảm unread count đi 1", () => {
      fc.assert(
        fc.property(
          atLeastOneUnreadArb,
          fc.nat(),
          (notifications, indexSeed) => {
            // Chọn một index ngẫu nhiên
            const index = indexSeed % notifications.length;

            // Đếm trước khi đánh dấu
            const countBefore = countUnreadNotifications(notifications);

            // Tạo bản sao với notification đã đánh dấu đọc
            const updatedNotifications = notifications.map((n, i) =>
              i === index ? { ...n, isRead: true } : n,
            );

            // Đếm sau khi đánh dấu
            const countAfter = countUnreadNotifications(updatedNotifications);

            expect(countAfter).toBe(countBefore - 1);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
