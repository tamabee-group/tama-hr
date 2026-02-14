# Requirements Document

## Introduction

This document defines the requirements for a real-time notification system for Tamabee HR, similar to Facebook's notification experience. The system will provide users with timely updates about relevant events such as payroll processing, leave requests, deposit approvals, and other HR-related activities. Notifications will be stored with codes (not text) to support i18n translation on the frontend.

## Glossary

- **Notification_System**: The backend service responsible for creating, storing, and delivering notifications to users
- **Notification_Bell**: The UI component in the header displaying unread notification count and recent notifications popup
- **Notification_Page**: The full-page view showing all notifications with pagination
- **Notification_Code**: A unique identifier for each notification type, used for i18n translation on frontend
- **Target_URL**: The URL to redirect users when they click on a notification
- **WebSocket_Connection**: WebSocket connection (using Socket.IO on frontend, Spring WebSocket on backend) for real-time notification delivery

## Requirements

### Requirement 1: Notification Storage

**User Story:** As a system administrator, I want notifications stored with codes and parameters, so that they can be translated to multiple languages on the frontend.

#### Acceptance Criteria

1. THE Notification_System SHALL store each notification with a unique code identifier instead of translated text
2. THE Notification_System SHALL store notification parameters as JSON for dynamic content interpolation
3. THE Notification_System SHALL track read/unread status for each notification per user
4. THE Notification_System SHALL store a target URL for navigation when notification is clicked
5. THE Notification_System SHALL store notification type for categorization and filtering
6. WHEN a notification is created, THE Notification_System SHALL record the creation timestamp

### Requirement 2: Notification Types

**User Story:** As a user, I want to receive different types of notifications, so that I am informed about relevant events in the system.

#### Acceptance Criteria

1. THE Notification_System SHALL support welcome notifications (WELCOME_COMPANY, WELCOME_EMPLOYEE)
2. THE Notification_System SHALL support payroll notifications (PAYROLL_PERIOD_CREATED, PAYROLL_CONFIRMED, PAYROLL_PAID)
3. THE Notification_System SHALL support wallet notifications (DEPOSIT_APPROVED, DEPOSIT_REJECTED, LOW_BALANCE_WARNING)
4. THE Notification_System SHALL support leave request notifications (LEAVE_SUBMITTED, LEAVE_APPROVED, LEAVE_REJECTED)
5. THE Notification_System SHALL support adjustment request notifications (ADJUSTMENT_SUBMITTED, ADJUSTMENT_APPROVED, ADJUSTMENT_REJECTED)
6. THE Notification_System SHALL support general admin notifications (SYSTEM_ANNOUNCEMENT)

### Requirement 3: Role-Based Notification Delivery

**User Story:** As a user, I want to receive only notifications relevant to my role, so that I am not overwhelmed with irrelevant information.

#### Acceptance Criteria

1. WHEN a deposit is approved or rejected, THE Notification_System SHALL notify the Company Admin who submitted the deposit
2. WHEN payroll is confirmed or paid, THE Notification_System SHALL notify all affected employees
3. WHEN an employee submits a leave request, THE Notification_System SHALL notify Company Admin and Manager
4. WHEN a leave request is approved or rejected, THE Notification_System SHALL notify the employee who submitted it
5. WHEN an employee submits an adjustment request, THE Notification_System SHALL notify Company Admin and Manager
6. WHEN an adjustment request is approved or rejected, THE Notification_System SHALL notify the employee who submitted it
7. WHEN a new company is registered, THE Notification_System SHALL send a welcome notification to the Company Admin
8. WHEN a new employee is created, THE Notification_System SHALL send a welcome notification to that employee

### Requirement 4: Notification API Endpoints

**User Story:** As a frontend developer, I want API endpoints to manage notifications, so that I can build the notification UI.

#### Acceptance Criteria

1. THE Notification_System SHALL provide a paginated endpoint to list user notifications (GET /api/users/me/notifications)
2. THE Notification_System SHALL provide an endpoint to get unread notification count (GET /api/users/me/notifications/unread-count)
3. THE Notification_System SHALL provide an endpoint to mark a single notification as read (PUT /api/users/me/notifications/{id}/read)
4. THE Notification_System SHALL provide an endpoint to mark all notifications as read (PUT /api/users/me/notifications/read-all)
5. WHEN listing notifications, THE Notification_System SHALL return notifications sorted by creation date descending

### Requirement 5: Real-Time Notification Delivery

**User Story:** As a user, I want to receive notifications in real-time, so that I am immediately informed of important events.

#### Acceptance Criteria

1. THE Notification_System SHALL provide a WebSocket endpoint for real-time notification streaming (/ws/notifications)
2. WHEN a new notification is created for a user, THE Notification_System SHALL push it through the WebSocket connection if active
3. WHEN the WebSocket connection is established, THE Notification_System SHALL authenticate the user via JWT token
4. THE Notification_System SHALL send a heartbeat (ping/pong) every 30 seconds to keep connection alive
5. IF the WebSocket connection is lost, THEN THE Notification_Bell SHALL automatically reconnect with exponential backoff (unlimited retries)
6. WHEN WebSocket reconnects successfully, THE Notification_Bell SHALL fetch latest unread count and recent notifications via REST API once

### Requirement 6: Notification Bell UI

**User Story:** As a user, I want a notification bell in the header, so that I can quickly see if I have new notifications.

#### Acceptance Criteria

1. THE Notification_Bell SHALL display in both desktop and mobile headers for authenticated users
2. THE Notification_Bell SHALL show a badge with unread notification count when count is greater than zero
3. WHEN unread count exceeds 99, THE Notification_Bell SHALL display "99+"
4. WHEN the bell is clicked, THE Notification_Bell SHALL show a popup with the 5 most recent notifications
5. THE Notification_Bell popup SHALL include a "View All" link to the full notification page
6. WHEN a notification in the popup is clicked, THE Notification_Bell SHALL redirect to the target URL and mark it as read

### Requirement 7: Notification List Page

**User Story:** As a user, I want a dedicated page to view all my notifications, so that I can review my notification history.

#### Acceptance Criteria

1. THE Notification_Page SHALL be accessible at /me/notifications
2. THE Notification_Page SHALL display notifications in a paginated list
3. THE Notification_Page SHALL provide a "Mark All as Read" button
4. WHEN a notification item is clicked, THE Notification_Page SHALL redirect to the target URL and mark it as read
5. THE Notification_Page SHALL visually distinguish between read and unread notifications
6. THE Notification_Page SHALL display notification timestamp using relative time format (e.g., "5 minutes ago")

### Requirement 8: Internationalization Support

**User Story:** As a user, I want notifications displayed in my preferred language, so that I can understand them easily.

#### Acceptance Criteria

1. THE Notification_Bell SHALL translate notification codes to user's locale (vi, en, ja)
2. THE Notification_Page SHALL translate notification codes to user's locale
3. THE Notification_System SHALL support parameter interpolation in translated messages
4. WHEN displaying notifications, THE frontend SHALL use the notification code to look up translations from message files

### Requirement 9: Notification Click Behavior

**User Story:** As a user, I want to click on a notification to go directly to the relevant page, so that I can take action quickly.

#### Acceptance Criteria

1. WHEN a notification is clicked, THE Notification_System SHALL mark it as read
2. WHEN a notification is clicked, THE Notification_System SHALL redirect to the stored target URL
3. IF the target URL is invalid or inaccessible, THEN THE Notification_System SHALL redirect to the notification list page
