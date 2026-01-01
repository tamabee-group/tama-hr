# Requirements Document

## Introduction

Giao diện người dùng cho hệ thống chấm công và tính lương. Hỗ trợ 3 loại người dùng: Company Admin (cấu hình hệ thống), Manager (duyệt requests), và Employee (chấm công, xem lương). Giao diện đa ngôn ngữ (vi, en, ja) và responsive.

## Glossary

- **Settings_Page**: Trang cấu hình chấm công/lương cho Company Admin
- **Attendance_Page**: Trang chấm công cho Employee
- **Payroll_Page**: Trang quản lý lương cho Company Admin
- **Dashboard**: Trang tổng quan với thống kê
- **Schedule_Selector**: Component chọn lịch làm việc
- **Adjustment_Dialog**: Dialog yêu cầu sửa chấm công
- **Payslip_View**: Xem phiếu lương chi tiết
- **Break_Config_Form**: Form cấu hình giờ giải lao
- **Break_Timer**: Component bấm giờ giải lao
- **Overtime_Config_Form**: Form cấu hình hệ số tăng ca

## Requirements

### Requirement 1: Company Settings UI

**User Story:** As a company admin, I want to configure attendance and payroll settings through a user-friendly interface, so that I can customize the system for my company.

#### Acceptance Criteria

1. WHEN a company admin visits the settings page, THE System SHALL display tabs for each configuration type (Attendance, Payroll, Overtime, Allowance, Deduction, Break)
2. THE Settings_Page SHALL display current configuration values with editable form fields
3. WHEN a company admin saves settings, THE System SHALL validate inputs and show success/error messages
4. THE Settings_Page SHALL provide tooltips explaining each configuration option
5. THE Settings_Page SHALL show preview of how settings affect calculations
6. IF a setting change affects existing data, THEN THE System SHALL warn the admin before saving

### Requirement 2: Work Schedule Management UI

**User Story:** As a company admin, I want to manage work schedules through the UI, so that I can define when employees should work.

#### Acceptance Criteria

1. THE Schedule_Page SHALL display a list of all work schedules with name, type, and assignment count
2. WHEN creating a schedule, THE System SHALL provide form for fixed/flexible/shift schedule types
3. THE Schedule_Form SHALL validate that start time is before end time
4. THE Schedule_Page SHALL allow assigning schedules to employees via multi-select
5. THE Schedule_Page SHALL show which schedule is set as default
6. WHEN deleting a schedule with assignments, THE System SHALL warn and require confirmation

### Requirement 3: Employee Attendance UI

**User Story:** As an employee, I want to check in and check out easily, so that my attendance is recorded accurately.

#### Acceptance Criteria

1. THE Attendance_Page SHALL display a prominent Check-In/Check-Out button
2. WHEN employee checks in, THE System SHALL show current time and confirmation
3. THE Attendance_Page SHALL display today's attendance status (checked in, working hours so far)
4. THE Attendance_Page SHALL show attendance history in a calendar view
5. THE Attendance_Page SHALL highlight late arrivals and early departures
6. IF the company requires location, THEN THE System SHALL request and display location permission status
7. THE Attendance_Page SHALL work offline and sync when connection is restored

### Requirement 4: Attendance Adjustment Request UI

**User Story:** As an employee, I want to request corrections to my attendance times, so that errors can be fixed.

#### Acceptance Criteria

1. WHEN viewing attendance history, THE Employee SHALL see an "Request Adjustment" button for each record
2. THE Adjustment_Dialog SHALL display original times and allow entering requested times
3. THE Adjustment_Dialog SHALL require a reason for the adjustment
4. WHEN submitting adjustment, THE System SHALL show pending status
5. THE Employee SHALL see list of their pending and processed adjustment requests
6. WHEN adjustment is approved/rejected, THE System SHALL notify the employee

### Requirement 5: Manager Approval UI

**User Story:** As a manager, I want to review and approve/reject adjustment requests, so that attendance records are accurate.

#### Acceptance Criteria

1. THE Manager_Dashboard SHALL show count of pending adjustment requests
2. THE Approval_Page SHALL list all pending requests with employee name, original/requested times, reason
3. WHEN approving, THE Manager SHALL optionally add a comment
4. WHEN rejecting, THE Manager SHALL provide a rejection reason
5. THE Approval_Page SHALL support bulk approve/reject for multiple requests
6. THE System SHALL send notification to employee after approval/rejection

### Requirement 6: Schedule Selection UI

**User Story:** As an employee, I want to select my preferred work schedule, so that I can work at convenient times.

#### Acceptance Criteria

1. IF flexible scheduling is enabled, THEN THE Employee SHALL see schedule selection option
2. THE Schedule_Selector SHALL display available schedules with details (hours, break time)
3. THE Schedule_Selector SHALL highlight suggested schedules (past selections, company recommendations)
4. WHEN selecting a schedule, THE System SHALL show effective date range picker
5. IF approval is required, THEN THE System SHALL show pending status after selection
6. THE Employee SHALL see their current and upcoming schedule assignments

### Requirement 7: Payroll Dashboard UI

**User Story:** As a company admin, I want to view and manage payroll through a dashboard, so that I can process salaries efficiently.

#### Acceptance Criteria

1. THE Payroll_Dashboard SHALL display summary cards (total employees, total payroll amount, pending approvals)
2. THE Payroll_Dashboard SHALL show payroll status for current period (Draft, Finalized, Paid)
3. WHEN clicking "Preview Payroll", THE System SHALL calculate and display payroll for all employees
4. THE Payroll_Preview SHALL show breakdown: base salary, overtime, allowances, deductions, net salary
5. THE Payroll_Dashboard SHALL allow filtering by department, employee, salary type
6. WHEN clicking "Finalize", THE System SHALL confirm and lock payroll records

### Requirement 8: Payroll Processing UI

**User Story:** As a company admin, I want to process payments and send notifications, so that employees receive their salaries.

#### Acceptance Criteria

1. AFTER payroll is finalized, THE System SHALL enable "Process Payment" button
2. THE Payment_Page SHALL show payment status for each employee (Pending, Paid, Failed)
3. WHEN clicking "Pay All", THE System SHALL process payments for all employees
4. IF payment fails, THEN THE System SHALL show retry option for individual employees
5. AFTER payment, THE System SHALL enable "Send Notifications" button
6. WHEN sending notifications, THE System SHALL show delivery status

### Requirement 9: Employee Payslip UI

**User Story:** As an employee, I want to view my payslip, so that I understand my salary breakdown.

#### Acceptance Criteria

1. THE Employee_Payroll_Page SHALL list payslips by month
2. WHEN clicking a payslip, THE System SHALL display detailed breakdown
3. THE Payslip_View SHALL show: base salary, overtime details, allowances list, deductions list, net salary
4. THE Payslip_View SHALL allow downloading as PDF
5. THE Payslip_View SHALL show payment status and date
6. IF payslip is not yet available, THEN THE System SHALL show appropriate message

### Requirement 10: Holiday and Leave UI

**User Story:** As an employee, I want to view holidays and request leave, so that I can plan my time off.

#### Acceptance Criteria

1. THE Calendar_View SHALL display company holidays and national holidays
2. THE Leave_Request_Form SHALL allow selecting leave type, date range, and reason
3. WHEN submitting leave request, THE System SHALL check leave balance
4. THE Employee SHALL see their leave balance by type
5. THE Employee SHALL see list of their leave requests with status
6. THE Manager SHALL see pending leave requests for approval

### Requirement 11: Reports UI

**User Story:** As a company admin, I want to generate and export reports, so that I can analyze attendance and payroll data.

#### Acceptance Criteria

1. THE Reports_Page SHALL provide report type selection (Attendance, Payroll, Leave)
2. THE Reports_Page SHALL allow filtering by date range, department, employee
3. WHEN generating report, THE System SHALL display data in table format
4. THE Reports_Page SHALL provide export options (CSV, PDF)
5. THE Reports_Page SHALL show charts for visual analysis
6. THE System SHALL remember last used filter settings

### Requirement 12: Notifications UI

**User Story:** As a user, I want to receive notifications for important events, so that I stay informed.

#### Acceptance Criteria

1. THE System SHALL display notification bell icon with unread count
2. WHEN clicking notification bell, THE System SHALL show notification list
3. THE Notification_List SHALL show: adjustment approved/rejected, leave approved/rejected, salary notification
4. WHEN clicking a notification, THE System SHALL navigate to relevant page
5. THE System SHALL support marking notifications as read
6. THE System SHALL support email notifications for critical events

### Requirement 13: Responsive Design

**User Story:** As a user, I want to use the system on mobile devices, so that I can check in and view information anywhere.

#### Acceptance Criteria

1. THE Attendance_Page SHALL be fully functional on mobile devices
2. THE Check-In button SHALL be easily tappable on mobile
3. THE Navigation SHALL collapse to hamburger menu on mobile
4. THE Tables SHALL be scrollable horizontally on mobile
5. THE Forms SHALL stack vertically on mobile
6. THE System SHALL support touch gestures for common actions

### Requirement 14: Internationalization

**User Story:** As a user, I want to use the system in my preferred language, so that I can understand all content.

#### Acceptance Criteria

1. THE System SHALL support Vietnamese, English, and Japanese languages
2. ALL text content SHALL be translated using message files
3. THE Date/Time formats SHALL follow locale conventions
4. THE Currency formats SHALL follow locale conventions (JPY)
5. THE System SHALL remember user's language preference
6. WHEN switching language, THE System SHALL update all content without page reload

### Requirement 15: Break Time Configuration UI

**User Story:** As a company admin, I want to configure break time policies through a user-friendly interface, so that I can manage break settings for my company.

#### Acceptance Criteria

1. THE Break_Config_Form SHALL display toggle to enable/disable break time
2. THE Break_Config_Form SHALL display radio buttons to select break type (Paid/Unpaid)
3. THE Break_Config_Form SHALL display input fields for minimum and maximum break duration
4. THE Break_Config_Form SHALL display toggle to use legal minimum or custom policy
5. THE Break_Config_Form SHALL display toggle to enable/disable break tracking
6. THE Break_Config_Form SHALL display locale selector for legal requirements
7. WHEN legal minimum is selected, THE Form SHALL display the legal minimum value based on locale
8. THE Form SHALL validate that minimum does not exceed maximum
9. THE Form SHALL validate that custom minimum meets legal minimum when applicable
10. WHEN form is submitted, THE System SHALL call API to update break configuration
11. THE Form SHALL display success/error toast messages after submission
12. THE Break_Config_Form SHALL display toggle for fixed break mode
13. THE Break_Config_Form SHALL display input for number of break periods per attendance
14. WHEN fixed break mode is enabled, THE Form SHALL display break period configuration (start time, end time for each period)
15. THE Break_Config_Form SHALL display night shift configuration section
16. THE Form SHALL display time pickers for night shift start/end times
17. THE Form SHALL display separate minimum break input for night shifts

### Requirement 16: Break Time in Work Schedule Form

**User Story:** As a company admin, I want to configure break periods in work schedules, so that employees know when they should take breaks.

#### Acceptance Criteria

1. THE Work_Schedule_Form SHALL display section for break periods
2. THE Form SHALL allow adding multiple break periods (morning, lunch, afternoon)
3. THE Form SHALL display time pickers for break start and end time
4. THE Form SHALL display toggle for flexible vs fixed break
5. THE Form SHALL calculate and display total break duration
6. THE Form SHALL validate that break times fall within working hours
7. THE Form SHALL validate that total break meets minimum requirement
8. WHEN break period is added/removed, THE Form SHALL recalculate total break
9. FOR FIXED schedule type, THE Form SHALL require break period configuration
10. THE Form SHALL support overnight schedules (e.g., 17:00 to 07:00)
11. WHEN schedule is overnight, THE Form SHALL allow break periods that span midnight

### Requirement 17: Break Timer Component

**User Story:** As an employee, I want to easily start and end my break, so that my break time is accurately recorded.

#### Acceptance Criteria

1. THE Break_Timer SHALL display "Start Break" button when not on break
2. THE Break_Timer SHALL display "End Break" button and elapsed time when on break
3. THE Break_Timer SHALL display current break duration in real-time
4. THE Break_Timer SHALL display remaining break time if maximum is configured
5. WHEN break exceeds maximum, THE Timer SHALL display warning
6. WHEN "Start Break" is clicked, THE System SHALL call API to start break
7. WHEN "End Break" is clicked, THE System SHALL call API to end break
8. THE Timer SHALL be accessible from attendance check-in/out page
9. THE Timer SHALL display break status badge (On Break / Not on Break)
10. IF fixed break mode is enabled, THE Timer SHALL NOT be displayed (breaks are auto-applied)

### Requirement 18: Break History View

**User Story:** As an employee, I want to view my break history, so that I can track my break patterns.

#### Acceptance Criteria

1. THE Break_History SHALL display list of break records for selected date
2. THE Break_History SHALL display break start time, end time, and duration
3. THE Break_History SHALL display total break time for the day
4. THE Break_History SHALL indicate if break was compliant with minimum requirement
5. THE Break_History SHALL be accessible from attendance detail page
6. THE Break_History SHALL support date navigation

### Requirement 19: Break Summary in Attendance

**User Story:** As an employee, I want to see break summary in my attendance records, so that I understand how break affects my working hours.

#### Acceptance Criteria

1. THE Attendance_Record SHALL display total break duration
2. THE Attendance_Record SHALL display break type (Paid/Unpaid)
3. THE Attendance_Record SHALL display break compliance status
4. THE Attendance_Record SHALL display net working hours (after break deduction if unpaid)
5. THE Attendance_List SHALL display break column with total break time
6. IF break is non-compliant, THE Record SHALL display warning indicator

### Requirement 20: Break Reports

**User Story:** As a company admin, I want to view break time reports, so that I can monitor employee break patterns.

#### Acceptance Criteria

1. THE Daily_Break_Report SHALL display break records for all employees on selected date
2. THE Daily_Break_Report SHALL display columns: Employee, Total Break, Compliance Status
3. THE Monthly_Break_Report SHALL display break summary for selected month
4. THE Monthly_Break_Report SHALL display: Total Break Hours, Average Break, Compliance Rate
5. THE Report SHALL highlight non-compliant employees
6. THE Report SHALL support filtering by department/employee
7. THE Report SHALL support export to CSV

### Requirement 21: Overtime Configuration UI

**User Story:** As a company admin, I want to configure overtime multipliers through a user-friendly interface, so that I can customize overtime rates for my company.

#### Acceptance Criteria

1. THE Overtime_Config_Form SHALL display toggle to enable/disable overtime calculation
2. THE Overtime_Config_Form SHALL display input for standard working hours (default: 8)
3. THE Overtime_Config_Form SHALL display time pickers for night shift start/end times
4. THE Overtime_Config_Form SHALL display input fields for overtime multipliers:
   - Regular overtime rate (default: 1.25)
   - Night work rate (default: 1.25)
   - Night overtime rate (default: 1.50)
   - Holiday overtime rate (default: 1.35)
   - Holiday night overtime rate (default: 1.60)
5. THE Form SHALL display toggle to use legal minimum or custom multipliers
6. THE Form SHALL display locale selector for legal requirements (Japan, Vietnam)
7. WHEN legal minimum is selected, THE Form SHALL display the legal minimum values based on locale
8. THE Form SHALL validate that custom multipliers are NOT below legal minimum
9. WHEN validation fails, THE Form SHALL display error message indicating legal minimum
10. WHEN form is submitted, THE System SHALL call API to update overtime configuration
11. THE Form SHALL display success/error toast messages after submission
12. THE Form SHALL display preview of how multipliers affect sample overtime calculation
13. THE Form SHALL be accessible from Company Settings page under "Overtime" tab

### Requirement 22: Overtime Summary in Payslip

**User Story:** As an employee, I want to see detailed overtime breakdown in my payslip, so that I understand how my overtime is calculated.

#### Acceptance Criteria

1. THE Payslip_View SHALL display overtime section with detailed breakdown
2. THE Overtime_Section SHALL display:
   - Regular hours worked
   - Regular overtime hours and amount
   - Night work hours and amount
   - Night overtime hours and amount
   - Holiday overtime hours and amount (if applicable)
   - Holiday night overtime hours and amount (if applicable)
3. THE Overtime_Section SHALL display multiplier used for each overtime type
4. THE Overtime_Section SHALL display total overtime amount
5. IF no overtime, THE Section SHALL display "No overtime this period"
6. THE Overtime_Section SHALL be collapsible/expandable for cleaner view

### Requirement 23: Overtime Summary in Attendance

**User Story:** As an employee, I want to see overtime summary in my attendance records, so that I can track my overtime hours.

#### Acceptance Criteria

1. THE Attendance_Record SHALL display overtime hours (if any)
2. THE Attendance_Record SHALL display night hours (if any)
3. THE Attendance_List SHALL display overtime column with total overtime hours
4. THE Attendance_Detail SHALL display breakdown of regular/night/overtime hours
5. IF attendance spans overnight, THE Record SHALL display correct hour split
6. THE Record SHALL indicate if overtime requires approval

### Requirement 24: Timeline View cho Multiple Break Sessions

**User Story:** As an employee, I want to see my break sessions in a timeline view, so that I can easily visualize when I took breaks during the day.

#### Acceptance Criteria

1. WHEN viewing attendance details, THE System SHALL display all break sessions in a vertical timeline layout
2. THE Timeline_View SHALL show each break as a card with breakNumber, start time, end time, and duration
3. THE Timeline_View SHALL order breaks by breakNumber ascending (1st, 2nd, 3rd)
4. WHEN a break is currently active (no end time), THE System SHALL highlight it with a different color and show "Đang nghỉ" status
5. THE Timeline_View SHALL show total break time at the bottom as summary
6. THE Timeline_View SHALL display break compliance status (đủ/thiếu so với minimum required)

### Requirement 25: Start/End Break với Multiple Sessions

**User Story:** As an employee, I want to start and end multiple break sessions, so that I can track all my breaks throughout the day.

#### Acceptance Criteria

1. WHEN employee has no active break, THE System SHALL show "Bắt đầu nghỉ" button
2. WHEN employee has an active break, THE System SHALL show "Kết thúc nghỉ" button instead
3. WHEN employee reaches maxBreaksPerDay, THE System SHALL disable the start break button and show message "Đã đạt giới hạn số lần nghỉ trong ngày"
4. WHEN a new break is started, THE System SHALL add it to the timeline with the next breakNumber
5. WHEN a break is ended, THE System SHALL update the timeline to show the completed break
6. THE System SHALL display current break count (e.g., "Lần nghỉ 2/3")

### Requirement 26: Điều chỉnh Break cụ thể

**User Story:** As an employee, I want to request adjustment for a specific break session, so that I can correct errors in individual break records.

#### Acceptance Criteria

1. WHEN clicking on a break card in timeline, THE System SHALL show adjustment options for that specific break
2. THE Adjustment_Dialog SHALL pre-fill with the selected break's current times
3. THE Adjustment_Dialog SHALL include breakRecordId in the request payload
4. WHEN adjustment is submitted, THE System SHALL show which break session (breakNumber) is being adjusted
5. IF adjustment request is successful, THE System SHALL show success message with break session number
6. THE Adjustment_Dialog SHALL validate that adjusted times don't overlap with other breaks

### Requirement 27: Break Report với Multiple Sessions

**User Story:** As a manager, I want to see break reports with all sessions, so that I can monitor employee break patterns.

#### Acceptance Criteria

1. WHEN viewing daily break report, THE System SHALL show all break sessions for each employee
2. THE Report_Table SHALL include columns: Employee, Break Sessions (expandable), Total Break Time, Compliance
3. WHEN expanding break sessions, THE System SHALL show timeline view of all breaks for that employee
4. THE Report SHALL calculate and display total break minutes from all sessions
5. THE Report SHALL highlight employees with non-compliant break patterns
6. THE Report SHALL support filtering by compliance status

### Requirement 28: Responsive Timeline Design

**User Story:** As a user, I want the timeline to work well on mobile devices, so that I can view breaks on my phone.

#### Acceptance Criteria

1. THE Timeline_View SHALL be responsive and work on mobile screens
2. WHEN on mobile, THE Timeline_View SHALL stack vertically with compact cards
3. THE Break_Card SHALL show essential info (time, duration) with expandable details
4. THE Start/End break buttons SHALL be easily tappable on mobile (min 44px height)
5. THE Timeline_View SHALL support swipe gestures for navigation between days
