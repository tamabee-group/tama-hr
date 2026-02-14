# Implementation Plan: Real-Time Notification System

## Overview

- This implementation plan breaks down the notification system into discrete coding tasks. The backend (Java/Spring Boot) will be implemented first, followed by the frontend (Next.js). Each task builds on previous tasks to ensure incremental progress with no orphaned code.

- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Backend: Database and Entity Setup
  - [x] 1.1 Create NotificationType enum in `enums/` folder
    - Define enum values: WELCOME, PAYROLL, WALLET, LEAVE, ADJUSTMENT, SYSTEM
    - _Requirements: 2.1-2.6_
  - [x] 1.2 Create NotificationCode constants class in `constants/` folder
    - Define all notification code constants (WELCOME_COMPANY, LEAVE_APPROVED, etc.)
    - _Requirements: 2.1-2.6_
  - [x] 1.3 Create NotificationEntity in `entity/core/` folder
    - Extend BaseEntity, add fields: userId, code, params, targetUrl, type, isRead
    - NO soft delete (high volume data)
    - _Requirements: 1.1-1.6_
  - [x] 1.4 Add Flyway migration for notifications table
    - Add to V1 schema file: CREATE TABLE notifications with indexes
    - Index on user_id, (user_id, is_read), created_at DESC
    - _Requirements: 1.1-1.6_

- [x] 2. Backend: Repository and DTOs
  - [x] 2.1 Create NotificationRepository in `repository/core/` folder
    - findByUserIdOrderByCreatedAtDesc with Pageable
    - countByUserIdAndIsReadFalse
    - findByIdAndUserId
    - _Requirements: 4.1, 4.2, 4.5_
  - [x] 2.2 Create NotificationResponse DTO in `dto/response/` folder
    - Fields: id, code, params (Map), targetUrl, type, isRead, createdAt
    - _Requirements: 4.1_
  - [x] 2.3 Create NotificationMapper in `mapper/core/` folder
    - toResponse method to convert entity to DTO
    - Handle JSON params parsing
    - _Requirements: 4.1_

- [x] 3. Backend: Service Layer
  - [x] 3.1 Create INotificationService interface in `service/core/`
    - Define methods: getNotifications, getUnreadCount, markAsRead, markAllAsRead
    - Define creation methods: createNotification, createBulkNotifications
    - Define WebSocket method: pushNotification
    - _Requirements: 4.1-4.5, 5.1-5.2_
  - [x] 3.2 Create NotificationServiceImpl in `service/core/impl/`
    - Implement all interface methods
    - Use SimpMessagingTemplate for WebSocket push
    - _Requirements: 4.1-4.5, 5.1-5.4_
  - [x] 3.3 Create WebSocketConfig in `config/`
    - Configure STOMP message broker
    - Register /ws/notifications endpoint with SockJS
    - _Requirements: 5.1, 5.3_
  - [x] 3.4 Create WebSocketAuthInterceptor in `config/`
    - Validate JWT token on WebSocket CONNECT
    - Set user principal for session
    - _Requirements: 5.3_
  - [ ]\* 3.5 Write property test for unread count accuracy
    - **Property 2: Unread Count Accuracy**
    - **Validates: Requirements 4.2**
  - [ ]\* 3.6 Write property test for notification list ordering
    - **Property 5: Notification List Ordering**
    - **Validates: Requirements 4.5**

- [x] 4. Backend: Controller Layer
  - [x] 4.1 Create NotificationController in `controller/core/`
    - GET /api/users/me/notifications (paginated list)
    - GET /api/users/me/notifications/unread-count
    - PUT /api/users/me/notifications/{id}/read
    - PUT /api/users/me/notifications/read-all
    - _Requirements: 4.1-4.4_
  - [ ]\* 4.2 Write unit tests for NotificationController
    - Test all endpoints with valid/invalid inputs
    - Test authorization (user can only access own notifications)
    - _Requirements: 4.1-4.4_

- [x] 5. Checkpoint - Backend API Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Backend: Integration with Existing Services
  - [x] 6.1 Add notification creation to LeaveService
    - On leave request submit: notify admin/manager
    - On leave approve/reject: notify employee
    - _Requirements: 3.3, 3.4_
  - [x] 6.2 Add notification creation to AdjustmentService
    - On adjustment request submit: notify admin/manager
    - On adjustment approve/reject: notify employee
    - _Requirements: 3.5, 3.6_
  - [x] 6.3 Add notification creation to DepositService (if exists) or WalletService
    - On deposit approve/reject: notify company admin
    - _Requirements: 3.1_
  - [x] 6.4 Add notification creation to PayrollService
    - On payroll confirm/paid: notify affected employees
    - _Requirements: 3.2_
  - [x] 6.5 Add welcome notification to user/company registration
    - On company register: notify company admin
    - On employee create: notify employee
    - _Requirements: 3.7, 3.8_

- [x] 7. Frontend: Types and API Functions
  - [x] 7.1 Create Notification types in `types/notification.ts`
    - Define Notification interface, NotificationType type
    - _Requirements: 4.1_
  - [x] 7.2 Create notification API functions in `lib/apis/notification.ts`
    - getNotifications, getUnreadCount, markAsRead, markAllAsRead
    - _Requirements: 4.1-4.4_
  - [x] 7.3 Create Socket.IO client in `lib/socket.ts`
    - Setup socket connection with JWT auth
    - Unlimited reconnection with exponential backoff (no polling)
    - _Requirements: 5.1, 5.3, 5.5_
  - [x] 7.4 Create useNotifications hook in `hooks/use-notifications.ts`
    - Manage notifications state, unread count
    - Handle Socket.IO connection for real-time updates
    - On reconnect: fetch latest data via API once (no polling)
    - Expose markAsRead, markAllAsRead functions
    - _Requirements: 5.1-5.6, 6.2_

- [x] 8. Frontend: i18n Setup
  - [x] 8.1 Create notification translations in `messages/vi/notifications.json`
    - Add all notification codes with Vietnamese translations
    - Add UI strings: title, markAllRead, viewAll, noNotifications
    - Add timeAgo strings for relative time
    - _Requirements: 8.1-8.4_
  - [x] 8.2 Create notification translations in `messages/en/notifications.json`
    - Add all notification codes with English translations
    - _Requirements: 8.1-8.4_
  - [x] 8.3 Create notification translations in `messages/ja/notifications.json`
    - Add all notification codes with Japanese translations
    - _Requirements: 8.1-8.4_
  - [x] 8.4 Create translateNotification utility in `lib/utils/notification.ts`
    - Function to translate code with params interpolation
    - Function to format relative time
    - _Requirements: 8.3, 7.6_
  - [ ]\* 8.5 Write property test for badge display formatting
    - **Property 6: Badge Display Formatting**
    - **Validates: Requirements 6.2, 6.3**
  - [ ]\* 8.6 Write property test for relative time formatting
    - **Property 9: Relative Time Formatting**
    - **Validates: Requirements 7.6**

- [x] 9. Frontend: NotificationBell Component
  - [x] 9.1 Create NotificationBell component in `_components/_header/_notification-bell.tsx`
    - Bell icon with unread badge (show 99+ when > 99)
    - Popup with 5 recent notifications on click
    - "View All" link to /me/notifications
    - Click notification to navigate and mark as read
    - _Requirements: 6.1-6.6_
  - [x] 9.2 Integrate NotificationBell into DesktopHeader
    - Add bell between title and user menu area
    - _Requirements: 6.1_
  - [x] 9.3 Integrate NotificationBell into MobileHeader
    - Add bell next to avatar dropdown
    - _Requirements: 6.1_

- [x] 10. Checkpoint - Notification Bell Complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Frontend: Notification List Page
  - [x] 11.1 Create notification page at `(PersonalLayout)/me/notifications/page.tsx`
    - Server component that renders NotificationContent
    - _Requirements: 7.1_
  - [x] 11.2 Create NotificationContent component
    - Full list with pagination using BaseTable or custom list
    - "Mark All as Read" button
    - Visual distinction for read/unread (opacity, background)
    - Click to navigate and mark as read
    - Relative time display for timestamps
    - _Requirements: 7.2-7.6_
  - [x] 11.3 Update PersonalLayout header config
    - Add /me/notifications to mainPages with title
    - _Requirements: 7.1_
  - [x] 11.4 Add notifications link to sidebar config
    - Add notifications menu item to PersonalLayout sidebar
    - _Requirements: 7.1_

- [x] 12. Frontend: Click Behavior and Navigation
  - [x] 12.1 Implement notification click handler
    - Mark as read via API
    - Navigate to targetUrl (or /me/notifications if invalid)
    - _Requirements: 9.1-9.3_
  - [ ]\* 12.2 Write property test for click behavior
    - **Property 7: Notification Click Behavior**
    - **Validates: Requirements 6.6, 7.4, 9.1, 9.2**

- [x] 13. Final Checkpoint - Full Feature Complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify SSE real-time updates work
  - Verify all notification types trigger correctly
  - Verify i18n works for vi, en, ja

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Backend tasks (1-6) should be completed before frontend tasks (7-12)
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
