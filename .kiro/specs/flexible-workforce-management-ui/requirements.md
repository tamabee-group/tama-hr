# Requirements Document

## Introduction

Giao diện người dùng cho hệ thống quản lý nhân sự linh hoạt, hỗ trợ các doanh nghiệp tự do như quán ăn, nhà hàng, cafe. Frontend cần:

- Hiển thị chấm công thống nhất (attendance + break trong 1 view)
- Quản lý ca làm việc và đổi ca với confirmation dialogs
- Cấu hình lương và phụ cấp/khấu trừ cá nhân
- Workflow duyệt lương với preview và chỉnh sửa
- Quản lý hợp đồng lao động
- Báo cáo và thống kê
- Detail pages/dialogs cho tất cả các chức năng
- Confirmation dialogs cho các action ảnh hưởng đến người khác

## Glossary

- **Attendance_Page**: Trang chấm công thống nhất hiển thị check-in/out và break
- **Shift_Management_Page**: Trang quản lý ca làm việc và đổi ca
- **Employee_Salary_Page**: Trang cấu hình lương cá nhân
- **Payroll_Page**: Trang quản lý kỳ lương với workflow
- **Contract_Page**: Trang quản lý hợp đồng lao động
- **Report_Page**: Trang báo cáo và thống kê
- **Confirmation_Dialog**: Dialog xác nhận trước khi thực hiện action
- **Detail_Dialog**: Dialog hiển thị chi tiết của một record

## Requirements

### Requirement 1: Unified Attendance View (Employee)

**User Story:** As an employee, I want to see my attendance and break records in a single view, so that I can track my work time easily.

#### Acceptance Criteria

1. WHEN an employee opens the attendance page, THE Attendance_Page SHALL display today's check-in/out status with all break records
2. WHEN an employee views attendance history, THE Attendance_Page SHALL show a calendar view with attendance status for each day
3. WHEN an employee clicks on a day in the calendar, THE Attendance_Page SHALL open a detail dialog showing full attendance info including breaks
4. WHEN an employee performs check-in, THE Attendance_Page SHALL update the UI immediately and show the check-in time
5. WHEN an employee starts/ends a break, THE Attendance_Page SHALL update the break list in real-time
6. WHEN viewing attendance detail, THE Detail_Dialog SHALL show original times, rounded times, working minutes, overtime, and all breaks
7. THE Attendance_Page SHALL display break compliance status (compliant/non-compliant) based on company settings

### Requirement 2: Attendance Management (Manager)

**User Story:** As a manager, I want to view and manage all employees' attendance records, so that I can monitor workforce attendance.

#### Acceptance Criteria

1. WHEN a manager opens attendance management, THE Attendance_Page SHALL display a table of all employees' attendance with filters
2. WHEN a manager filters by date range, employee, or status, THE Attendance_Page SHALL update the table accordingly
3. WHEN a manager clicks on an attendance record, THE Detail_Dialog SHALL show complete attendance info with break records
4. WHEN a manager views attendance detail, THE Detail_Dialog SHALL show applied settings snapshot (rounding, break config)
5. WHEN a manager views attendance detail, THE Detail_Dialog SHALL show adjustment history if any
6. THE Attendance_Page SHALL support pagination and sorting

### Requirement 3: Shift Management

**User Story:** As a manager, I want to create shifts and assign employees to shifts, so that I can organize work schedules.

#### Acceptance Criteria

1. WHEN a manager opens shift management, THE Shift_Management_Page SHALL display a list of shift templates
2. WHEN a manager creates a shift template, THE Shift_Management_Page SHALL show a form with name, start time, end time, break minutes, multiplier
3. WHEN a manager views shift assignments, THE Shift_Management_Page SHALL display a calendar/table view of assignments by date
4. WHEN a manager assigns an employee to a shift, THE Shift_Management_Page SHALL show a dialog to select employee and date
5. WHEN a manager clicks on a shift assignment, THE Detail_Dialog SHALL show shift details and employee info
6. IF a shift assignment would overlap with existing assignment, THEN THE Shift_Management_Page SHALL show an error message

### Requirement 4: Shift Swap Management

**User Story:** As a manager, I want to review and approve shift swap requests, so that employees can exchange shifts when needed.

#### Acceptance Criteria

1. WHEN a manager opens shift swap requests, THE Shift_Management_Page SHALL display pending swap requests
2. WHEN a manager clicks on a swap request, THE Detail_Dialog SHALL show requester info, target employee info, and both shifts
3. WHEN a manager approves a swap request, THE Confirmation_Dialog SHALL appear asking for confirmation
4. WHEN a manager rejects a swap request, THE Confirmation_Dialog SHALL appear with a reason input field
5. WHEN a swap is approved, THE Shift_Management_Page SHALL update both employees' assignments immediately
6. THE Shift_Management_Page SHALL show swap request history with status

### Requirement 5: Employee Shift Swap Request

**User Story:** As an employee, I want to request to swap shifts with another employee, so that I can adjust my schedule when needed.

#### Acceptance Criteria

1. WHEN an employee views their schedule, THE Schedule_Page SHALL show their assigned shifts
2. WHEN an employee wants to swap a shift, THE Schedule_Page SHALL show available shifts from other employees
3. WHEN an employee selects a shift to swap with, THE Confirmation_Dialog SHALL appear showing both shifts
4. WHEN an employee submits a swap request, THE Schedule_Page SHALL show the pending request status
5. WHEN a swap request is approved/rejected, THE Schedule_Page SHALL update and notify the employee

### Requirement 6: Employee Salary Configuration

**User Story:** As a manager, I want to configure individual salary settings for each employee, so that I can handle different employment types.

#### Acceptance Criteria

1. WHEN a manager opens employee salary config, THE Employee_Salary_Page SHALL display current salary settings
2. WHEN a manager creates/updates salary config, THE Employee_Salary_Page SHALL show a form with salary type selection (MONTHLY, DAILY, HOURLY, SHIFT_BASED)
3. WHEN MONTHLY is selected, THE form SHALL show monthly salary input
4. WHEN DAILY is selected, THE form SHALL show daily rate input
5. WHEN HOURLY is selected, THE form SHALL show hourly rate input
6. WHEN SHIFT_BASED is selected, THE form SHALL show shift rate input
7. WHEN a manager saves salary config, THE Confirmation_Dialog SHALL appear if it affects current payroll period
8. THE Employee_Salary_Page SHALL show salary config history with effective dates

### Requirement 7: Individual Allowance/Deduction Management

**User Story:** As a manager, I want to assign specific allowances and deductions to individual employees, so that each employee can have personalized compensation.

#### Acceptance Criteria

1. WHEN a manager opens employee allowances, THE page SHALL display assigned allowances with amounts and effective dates
2. WHEN a manager adds an allowance, THE form SHALL show allowance type, amount, taxable flag, effective dates
3. WHEN a manager opens employee deductions, THE page SHALL display assigned deductions with amounts and effective dates
4. WHEN a manager adds a deduction, THE form SHALL show deduction type, amount/percentage, effective dates
5. WHEN a manager deactivates an allowance/deduction, THE Confirmation_Dialog SHALL appear
6. THE page SHALL show both company defaults and individual overrides clearly distinguished

### Requirement 8: Payroll Period Management

**User Story:** As a manager, I want to manage payroll periods with a review workflow, so that I can verify and adjust salaries before finalizing.

#### Acceptance Criteria

1. WHEN a manager opens payroll management, THE Payroll_Page SHALL display payroll periods with status (DRAFT, REVIEWING, APPROVED, PAID)
2. WHEN a manager creates a payroll period, THE form SHALL show period start/end dates
3. WHEN a manager clicks on a payroll period, THE Detail_Dialog SHALL show all payroll items with summary
4. WHEN a manager views payroll detail, THE page SHALL show breakdown: base salary, overtime, allowances, deductions, gross, net
5. WHEN a manager adjusts a payroll item, THE form SHALL require adjustment amount and reason
6. WHEN a manager submits for review, THE Confirmation_Dialog SHALL appear with summary
7. WHEN a manager approves payroll, THE Confirmation_Dialog SHALL appear warning that changes will be locked
8. WHEN a manager marks as paid, THE Confirmation_Dialog SHALL appear with payment reference input
9. IF payroll is APPROVED or PAID, THEN THE Payroll_Page SHALL disable all edit actions

### Requirement 9: Payroll Item Detail

**User Story:** As a manager, I want to view detailed payroll breakdown for each employee, so that I can verify calculations.

#### Acceptance Criteria

1. WHEN a manager clicks on a payroll item, THE Detail_Dialog SHALL show complete breakdown
2. THE Detail_Dialog SHALL show base salary calculation based on salary type
3. THE Detail_Dialog SHALL show overtime breakdown (regular, night, holiday, weekend)
4. THE Detail_Dialog SHALL show all applied allowances with amounts
5. THE Detail_Dialog SHALL show all applied deductions with amounts
6. THE Detail_Dialog SHALL show break deduction if applicable
7. THE Detail_Dialog SHALL show adjustment history if any
8. THE Detail_Dialog SHALL show gross and net salary with calculation formula

### Requirement 10: Employment Contract Management

**User Story:** As a manager, I want to manage employment contracts for each employee, so that I can track contract terms and renewal dates.

#### Acceptance Criteria

1. WHEN a manager opens contract management, THE Contract_Page SHALL display contracts with status (ACTIVE, EXPIRED, TERMINATED)
2. WHEN a manager creates a contract, THE form SHALL show contract type, start date, end date, linked salary config
3. WHEN a manager clicks on a contract, THE Detail_Dialog SHALL show full contract info
4. WHEN a manager terminates a contract, THE Confirmation_Dialog SHALL appear with reason input
5. THE Contract_Page SHALL highlight contracts expiring within 30 days
6. THE Contract_Page SHALL show notification badge for expiring contracts
7. IF a contract would overlap with existing contract, THEN THE Contract_Page SHALL show an error message

### Requirement 11: Reports and Statistics

**User Story:** As a manager, I want to generate reports on attendance and payroll, so that I can analyze workforce performance and costs.

#### Acceptance Criteria

1. WHEN a manager opens reports, THE Report_Page SHALL show available report types
2. WHEN a manager selects attendance summary report, THE Report_Page SHALL show filters (date range, employee, department)
3. WHEN a manager generates a report, THE Report_Page SHALL display results in table and chart format
4. WHEN a manager exports a report, THE Report_Page SHALL support CSV and PDF formats
5. THE Report_Page SHALL show overtime breakdown report
6. THE Report_Page SHALL show break compliance report
7. THE Report_Page SHALL show payroll summary report
8. THE Report_Page SHALL show cost analysis report
9. THE Report_Page SHALL show shift utilization report

### Requirement 12: Confirmation Dialogs

**User Story:** As a user, I want to see confirmation dialogs before performing actions that affect others, so that I can avoid accidental changes.

#### Acceptance Criteria

1. WHEN approving/rejecting a shift swap, THE Confirmation_Dialog SHALL appear with action summary
2. WHEN approving/rejecting a payroll period, THE Confirmation_Dialog SHALL appear with impact summary
3. WHEN terminating a contract, THE Confirmation_Dialog SHALL appear with warning
4. WHEN deactivating an allowance/deduction, THE Confirmation_Dialog SHALL appear
5. WHEN adjusting a payroll item, THE Confirmation_Dialog SHALL appear if amount is significant
6. ALL Confirmation_Dialogs SHALL have clear Cancel and Confirm buttons
7. ALL Confirmation_Dialogs SHALL show the action being performed and its impact

### Requirement 13: Detail Dialogs/Pages

**User Story:** As a user, I want to see detailed information in dialogs or dedicated pages, so that I can understand the full context.

#### Acceptance Criteria

1. WHEN clicking on an attendance record, THE system SHALL show a detail dialog with all related info
2. WHEN clicking on a shift assignment, THE system SHALL show a detail dialog with shift and employee info
3. WHEN clicking on a payroll item, THE system SHALL show a detail dialog with full breakdown
4. WHEN clicking on a contract, THE system SHALL show a detail dialog with contract terms
5. ALL detail dialogs SHALL have a close button and be dismissible by clicking outside
6. ALL detail dialogs SHALL be responsive and work on mobile devices
