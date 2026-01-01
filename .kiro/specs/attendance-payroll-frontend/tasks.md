# Implementation Plan: Attendance & Payroll Frontend System

## Overview

- Triển khai giao diện người dùng cho hệ thống chấm công và tính lương. Sử dụng Next.js 16 App Router, TypeScript, và Shadcn/ui components. Hỗ trợ đa ngôn ngữ (vi, en, ja).
- Khi KIRO thực hiện task thì hãy phản hồi tôi bằng tiếng Việt.

## Tasks

- [x] 1. TypeScript Types & Enums
  - [x] 1.1 Tạo Enums cho Attendance/Payroll
    - Tạo file `types/attendance-enums.ts`
    - RoundingInterval, RoundingDirection, SalaryType
    - AttendanceStatus, PayrollStatus, PaymentStatus
    - AdjustmentStatus, SelectionStatus, ScheduleType
    - AllowanceType, DeductionType, LeaveType, LeaveStatus
    - _Requirements: All_

  - [x] 1.2 Tạo Configuration Types
    - Tạo file `types/attendance-config.ts`
    - AttendanceConfig, RoundingConfig
    - PayrollConfig, OvertimeConfig
    - AllowanceConfig, AllowanceRule
    - DeductionConfig, DeductionRule
    - _Requirements: 1.1-1.6_

  - [x] 1.3 Tạo Record Types
    - Tạo file `types/attendance-records.ts`
    - AttendanceRecord, PayrollRecord
    - AdjustmentRequest, WorkSchedule
    - ScheduleSelection, LeaveRequest, LeaveBalance
    - Holiday
    - _Requirements: All_

- [x] 2. i18n Messages
  - [x] 2.1 Thêm namespace attendance vào messages
    - Thêm keys cho attendance pages
    - Labels, buttons, status messages
    - Error messages
    - _Requirements: 14.1, 14.2_

  - [x] 2.2 Thêm namespace payroll vào messages
    - Thêm keys cho payroll pages
    - Salary breakdown labels
    - Payment status messages
    - _Requirements: 14.1, 14.2_

  - [x] 2.3 Thêm namespace schedules vào messages
    - Thêm keys cho schedule pages
    - Schedule type labels
    - Assignment messages
    - _Requirements: 14.1, 14.2_

  - [x] 2.4 Thêm namespace leave vào messages
    - Thêm keys cho leave pages
    - Leave type labels
    - Balance messages
    - _Requirements: 14.1, 14.2_

  - [x] 2.5 Thêm enum translations
    - Thêm translations cho tất cả enums mới
    - Trong namespace `enums`
    - _Requirements: 14.1, 14.2_

  - [x] 2.6 Write property test cho i18n completeness
    - **Property 4: i18n Translation Completeness**
    - **Validates: Requirements 14.1, 14.2**

- [x] 3. API Client Functions
  - [x] 3.1 Tạo Company Settings API
    - Tạo file `lib/apis/company-settings-api.ts`
    - getSettings, updateAttendanceConfig, updatePayrollConfig
    - updateOvertimeConfig, updateAllowanceConfig, updateDeductionConfig
    - _Requirements: 1.1-1.6_

  - [x] 3.2 Tạo Work Schedule API
    - Tạo file `lib/apis/work-schedule-api.ts`
    - CRUD operations
    - assignSchedule, getEffectiveSchedule
    - _Requirements: 2.1-2.6_

  - [x] 3.3 Tạo Attendance API
    - Tạo file `lib/apis/attendance-api.ts`
    - checkIn, checkOut
    - getAttendanceRecords, getAttendanceSummary
    - _Requirements: 3.1-3.7_

  - [x] 3.4 Tạo Adjustment API
    - Tạo file `lib/apis/adjustment-api.ts`
    - createAdjustmentRequest
    - approveAdjustment, rejectAdjustment
    - getPendingRequests
    - _Requirements: 4.1-4.6, 5.1-5.6_

  - [x] 3.5 Tạo Schedule Selection API
    - Tạo file `lib/apis/schedule-selection-api.ts`
    - selectSchedule, getSuggestedSchedules
    - approveSelection, rejectSelection
    - _Requirements: 6.1-6.6_

  - [x] 3.6 Tạo Payroll API
    - Tạo file `lib/apis/payroll-api.ts`
    - previewPayroll, finalizePayroll
    - markAsPaid, sendNotifications
    - getPayrollRecords, exportCsv, exportPdf
    - _Requirements: 7.1-7.6, 8.1-8.6, 9.1-9.6_

  - [x] 3.7 Tạo Leave API
    - Tạo file `lib/apis/leave-api.ts`
    - createLeaveRequest, approveLeave, rejectLeave
    - getLeaveBalance, getLeaveRequests
    - _Requirements: 10.1-10.6_

  - [x] 3.8 Tạo Holiday API
    - Tạo file `lib/apis/holiday-api.ts`
    - CRUD operations
    - getHolidaysByDateRange
    - _Requirements: 10.1, 10.2_

  - [x] 3.9 Tạo Report API
    - Tạo file `lib/apis/report-api.ts`
    - generateReport, exportCsv, exportPdf
    - _Requirements: 11.1-11.6_

- [x] 4. Checkpoint - Types & APIs
  - Ensure all types compile, ask the user if questions arise.

- [x] 5. Shared Components
  - [x] 5.1 Tạo StatusBadge component
    - Tạo file `_components/_shared/_status-badge.tsx`
    - Support all status types với colors
    - _Requirements: All_

  - [x] 5.2 Tạo TimeDisplay component
    - Tạo file `_components/_shared/_time-display.tsx`
    - Format time theo locale
    - _Requirements: 14.3_

  - [x] 5.3 Tạo CurrencyDisplay component
    - Tạo file `_components/_shared/_currency-display.tsx`
    - Format currency (JPY)
    - _Requirements: 14.4_

  - [x] 5.4 Tạo CalendarView component
    - Tạo file `_components/_shared/_calendar-view.tsx`
    - Month view với date selection
    - Highlight special dates (holidays, leave)
    - _Requirements: 3.4, 10.1_

  - [x] 5.5 Tạo NotificationBell component
    - Tạo file `_components/_shared/_notification-bell.tsx`
    - Unread count badge
    - Notification dropdown
    - _Requirements: 12.1-12.5_

  - [x] 5.6 Write property test cho Notification Count
    - **Property 6: Notification Count Accuracy**
    - **Validates: Requirements 12.1**

- [x] 6. Company Settings Pages
  - [x] 6.1 Tạo Settings page
    - Tạo file `company/settings/page.tsx`
    - Server component với getTranslations
    - _Requirements: 1.1_

  - [x] 6.2 Tạo SettingsTabs component
    - Tạo file `company/settings/_settings-tabs.tsx`
    - Tabs: Attendance, Payroll, Overtime, Allowance, Deduction
    - _Requirements: 1.1_

  - [x] 6.3 Tạo AttendanceConfigForm
    - Tạo file `company/settings/_attendance-config-form.tsx`
    - Form fields cho AttendanceConfig
    - Validation và tooltips
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 6.4 Tạo PayrollConfigForm
    - Tạo file `company/settings/_payroll-config-form.tsx`
    - Form fields cho PayrollConfig
    - _Requirements: 1.2, 1.3_

  - [x] 6.5 Tạo OvertimeConfigForm
    - Tạo file `company/settings/_overtime-config-form.tsx`
    - Form fields cho OvertimeConfig
    - _Requirements: 1.2, 1.3_

  - [x] 6.6 Tạo AllowanceConfigForm
    - Tạo file `company/settings/_allowance-config-form.tsx`
    - Dynamic list cho allowance rules
    - _Requirements: 1.2, 1.3_

  - [x] 6.7 Tạo DeductionConfigForm
    - Tạo file `company/settings/_deduction-config-form.tsx`
    - Dynamic list cho deduction rules
    - _Requirements: 1.2, 1.3_

  - [x] 6.8 Write property test cho Form Validation
    - **Property 1: Form Validation Consistency**
    - **Validates: Requirements 1.3**

- [x] 7. Work Schedule Pages
  - [x] 7.1 Tạo Schedules list page
    - Tạo file `company/schedules/page.tsx`
    - Table với schedules
    - _Requirements: 2.1_

  - [x] 7.2 Tạo ScheduleTable component
    - Tạo file `company/schedules/_schedule-table.tsx`
    - Columns: name, type, isDefault, assignmentCount
    - _Requirements: 2.1_

  - [x] 7.3 Tạo ScheduleForm component
    - Tạo file `company/schedules/_schedule-form.tsx`
    - Support FIXED/FLEXIBLE/SHIFT types
    - Time validation
    - _Requirements: 2.2, 2.3_

  - [x] 7.4 Write property test cho Schedule Time Validation
    - **Property 2: Schedule Time Validation**
    - **Validates: Requirements 2.3**

  - [x] 7.5 Tạo Schedule detail page
    - Tạo file `company/schedules/[id]/page.tsx`
    - Schedule info và assignments
    - _Requirements: 2.1, 2.4_

  - [x] 7.6 Tạo ScheduleDetail component
    - Tạo file `company/schedules/_schedule-detail.tsx`
    - Display schedule data
    - Assignment list
    - _Requirements: 2.1, 2.4_

  - [x] 7.7 Tạo ScheduleAssignmentDialog
    - Tạo file `company/schedules/_schedule-assignment-dialog.tsx`
    - Multi-select employees
    - _Requirements: 2.4_

- [x] 8. Checkpoint - Settings & Schedules
  - Ensure all settings and schedule pages work, ask the user if questions arise.

- [x] 9. Employee Attendance Pages
  - [x] 9.1 Tạo Employee Attendance page
    - Tạo file `employee/attendance/page.tsx`
    - Check-in section và calendar
    - _Requirements: 3.1, 3.4_

  - [x] 9.2 Tạo CheckInSection component
    - Tạo file `employee/attendance/_check-in-section.tsx`
    - Check-in/out button
    - Current status display
    - Location permission handling
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

  - [x] 9.3 Tạo AttendanceCalendar component
    - Tạo file `employee/attendance/_attendance-calendar.tsx`
    - Month view với attendance records
    - Highlight late/early
    - _Requirements: 3.4, 3.5_

  - [x] 9.4 Tạo AttendanceHistory component
    - Tạo file `employee/attendance/_attendance-history.tsx`
    - List view của attendance records
    - _Requirements: 3.4_

  - [x] 9.5 Tạo Attendance day detail page
    - Tạo file `employee/attendance/[date]/page.tsx`
    - Chi tiết attendance ngày cụ thể
    - _Requirements: 3.4_

  - [x] 9.6 Tạo AttendanceDayDetail component
    - Tạo file `employee/attendance/_attendance-day-detail.tsx`
    - Check-in/out times, working hours
    - Request adjustment button
    - _Requirements: 3.4, 4.1_

  - [x] 9.7 Tạo AdjustmentDialog component
    - Tạo file `employee/attendance/_adjustment-dialog.tsx`
    - Original/requested times
    - Reason input
    - _Requirements: 4.2, 4.3_

  - [x] 9.8 Write property test cho Attendance Status
    - **Property 5: Attendance Status Consistency**
    - **Validates: Requirements 3.5**

- [x] 10. Company Attendance Pages
  - [x] 10.1 Tạo Company Attendance page
    - Tạo file `company/attendance/page.tsx`
    - Table với all employees attendance
    - _Requirements: 3.4_

  - [x] 10.2 Tạo AttendanceTable component
    - Tạo file `company/attendance/_attendance-table.tsx`
    - Columns: employee, date, check-in/out, status
    - _Requirements: 3.4_

  - [x] 10.3 Tạo AttendanceFilters component
    - Tạo file `company/attendance/_attendance-filters.tsx`
    - Date range, employee, status filters
    - _Requirements: 3.4_

  - [x] 10.4 Tạo Attendance detail page
    - Tạo file `company/attendance/[id]/page.tsx`
    - Chi tiết attendance record
    - _Requirements: 3.4_

  - [x] 10.5 Tạo AttendanceDetail component
    - Tạo file `company/attendance/_attendance-detail.tsx`
    - Full record details
    - Adjustment history
    - _Requirements: 3.4_

- [x] 11. Adjustment Approval Pages
  - [x] 11.1 Tạo Adjustments page (Company)
    - Tạo file `company/adjustments/page.tsx`
    - Pending requests list
    - _Requirements: 5.1, 5.2_

  - [x] 11.2 Tạo ApprovalList component
    - Tạo file `company/adjustments/_approval-list.tsx`
    - Approve/reject buttons
    - Bulk actions
    - _Requirements: 5.2, 5.3, 5.4, 5.5_

  - [x] 11.3 Tạo Adjustment detail page
    - Tạo file `company/adjustments/[id]/page.tsx`
    - Chi tiết adjustment request
    - _Requirements: 5.2_

  - [x] 11.4 Tạo AdjustmentDetail component
    - Tạo file `company/adjustments/_adjustment-detail.tsx`
    - Original/requested comparison
    - Approve/reject with reason
    - _Requirements: 5.3, 5.4_

  - [x] 11.5 Tạo My Adjustments page (Employee)
    - Tạo file `employee/adjustments/page.tsx`
    - My requests list
    - _Requirements: 4.5_

  - [x] 11.6 Tạo MyAdjustments component
    - Tạo file `employee/adjustments/_my-adjustments.tsx`
    - Status tracking
    - _Requirements: 4.4, 4.5_

- [x] 12. Checkpoint - Attendance Pages
  - Ensure all attendance pages work, ask the user if questions arise.

- [x] 13. Schedule Selection Pages
  - [x] 13.1 Tạo Employee Schedule page
    - Tạo file `employee/schedule/page.tsx`
    - Current schedule và selector
    - _Requirements: 6.1, 6.6_

  - [x] 13.2 Tạo ScheduleSelector component
    - Tạo file `employee/schedule/_schedule-selector.tsx`
    - Available schedules list
    - Suggestions highlight
    - Date range picker
    - _Requirements: 6.2, 6.3, 6.4_

  - [x] 13.3 Tạo MyScheduleView component
    - Tạo file `employee/schedule/_my-schedule-view.tsx`
    - Current và upcoming schedules
    - _Requirements: 6.6_

- [x] 14. Payroll Pages
  - [x] 14.1 Tạo Payroll Dashboard page
    - Tạo file `company/payroll/page.tsx`
    - Summary cards và status
    - _Requirements: 7.1, 7.2_

  - [x] 14.2 Tạo PayrollDashboard component
    - Tạo file `company/payroll/_payroll-dashboard.tsx`
    - Total employees, total amount, pending
    - Period selector
    - _Requirements: 7.1, 7.2_

  - [x] 14.3 Tạo PayrollPreviewTable component
    - Tạo file `company/payroll/_payroll-preview-table.tsx`
    - Employee payroll breakdown
    - Finalize button
    - _Requirements: 7.3, 7.4, 7.6_

  - [x] 14.4 Tạo Payroll period detail page
    - Tạo file `company/payroll/[period]/page.tsx`
    - Chi tiết payroll period
    - _Requirements: 7.3_

  - [x] 14.5 Tạo PayrollPeriodDetail component
    - Tạo file `company/payroll/_payroll-period-detail.tsx`
    - Summary, records list
    - Actions: finalize, pay, notify, export
    - _Requirements: 7.3, 8.1-8.6_

  - [x] 14.6 Tạo PaymentStatusTable component
    - Tạo file `company/payroll/_payment-status-table.tsx`
    - Payment status per employee
    - Pay all, retry buttons
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 14.7 Tạo Payroll record detail page
    - Tạo file `company/payroll/records/[id]/page.tsx`
    - Chi tiết payroll record
    - _Requirements: 7.4_

  - [x] 14.8 Tạo PayrollRecordDetail component
    - Tạo file `company/payroll/_payroll-record-detail.tsx`
    - Full breakdown display
    - _Requirements: 7.4_

  - [x] 14.9 Write property test cho Payroll Breakdown
    - **Property 3: Payroll Breakdown Sum Invariant**
    - **Validates: Requirements 7.4, 9.3**

- [x] 15. Employee Payroll Pages
  - [x] 15.1 Tạo Employee Payroll page
    - Tạo file `employee/payroll/page.tsx`
    - Payslip list
    - _Requirements: 9.1_

  - [x] 15.2 Tạo PayslipList component
    - Tạo file `employee/payroll/_payslip-list.tsx`
    - List by month
    - _Requirements: 9.1_

  - [x] 15.3 Tạo Payslip detail page
    - Tạo file `employee/payroll/[period]/page.tsx`
    - Chi tiết payslip
    - _Requirements: 9.2_

  - [x] 15.4 Tạo PayslipView component
    - Tạo file `employee/payroll/_payslip-view.tsx`
    - Full breakdown
    - Download PDF button
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [x] 16. Checkpoint - Payroll Pages
  - Ensure all payroll pages work, ask the user if questions arise.

- [x] 17. Holiday & Leave Pages
  - [x] 17.1 Tạo Holidays page
    - Tạo file `company/holidays/page.tsx`
    - Holiday list
    - _Requirements: 10.1_

  - [x] 17.2 Tạo HolidayTable component
    - Tạo file `company/holidays/_holiday-table.tsx`
    - CRUD operations
    - _Requirements: 10.1_

  - [x] 17.3 Tạo HolidayForm component
    - Tạo file `company/holidays/_holiday-form.tsx`
    - Create/edit holiday
    - _Requirements: 10.1_

  - [x] 17.4 Tạo Leave Requests page (Company)
    - Tạo file `company/leave-requests/page.tsx`
    - Pending requests
    - _Requirements: 10.6_

  - [x] 17.5 Tạo LeaveApprovalList component
    - Tạo file `company/leave-requests/_leave-approval-list.tsx`
    - Approve/reject
    - _Requirements: 10.6_

  - [x] 17.6 Tạo Leave Request detail page
    - Tạo file `company/leave-requests/[id]/page.tsx`
    - Chi tiết leave request
    - _Requirements: 10.6_

  - [x] 17.7 Tạo LeaveRequestDetail component
    - Tạo file `company/leave-requests/_leave-request-detail.tsx`
    - Request details, approve/reject
    - _Requirements: 10.6_

  - [x] 17.8 Tạo Employee Leave page
    - Tạo file `employee/leave/page.tsx`
    - Balance và requests
    - _Requirements: 10.2, 10.4, 10.5_

  - [x] 17.9 Tạo LeaveBalance component
    - Tạo file `employee/leave/_leave-balance.tsx`
    - Balance by type
    - _Requirements: 10.4_

  - [x] 17.10 Tạo LeaveRequestForm component
    - Tạo file `employee/leave/_leave-request-form.tsx`
    - Type, date range, reason
    - Balance check
    - _Requirements: 10.2, 10.3_

  - [x] 17.11 Tạo LeaveHistory component
    - Tạo file `employee/leave/_leave-history.tsx`
    - Request history
    - _Requirements: 10.5_

- [x] 18. Reports Pages
  - [x] 18.1 Tạo Reports page
    - Tạo file `company/reports/page.tsx`
    - Report type selection
    - _Requirements: 11.1_

  - [x] 18.2 Tạo ReportGenerator component
    - Tạo file `company/reports/_report-generator.tsx`
    - Filters, generate, export
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 18.3 Tạo ReportChart component
    - Tạo file `company/reports/_report-chart.tsx`
    - Bar, line, pie charts
    - _Requirements: 11.5_

  - [x] 18.4 Tạo Attendance Report page
    - Tạo file `company/reports/attendance/page.tsx`
    - Attendance specific report
    - _Requirements: 11.1_

  - [x] 18.5 Tạo Payroll Report page
    - Tạo file `company/reports/payroll/page.tsx`
    - Payroll specific report
    - _Requirements: 11.1_

- [x] 19. Employee Detail Pages
  - [x] 19.1 Tạo Employees list page
    - Tạo file `company/employees/page.tsx`
    - Employee list
    - _Requirements: All_

  - [x] 19.2 Tạo EmployeeTable component
    - Tạo file `company/employees/_employee-table.tsx`
    - Employee list với links
    - _Requirements: All_

  - [x] 19.3 Tạo Employee detail page
    - Tạo file `company/employees/[id]/page.tsx`
    - Employee overview
    - _Requirements: All_

  - [x] 19.4 Tạo EmployeeDetail component
    - Tạo file `company/employees/_employee-detail.tsx`
    - Info, schedule, attendance summary
    - _Requirements: All_

  - [x] 19.5 Tạo Employee Attendance page
    - Tạo file `company/employees/[id]/attendance/page.tsx`
    - Attendance của employee cụ thể
    - _Requirements: 3.4_

  - [x] 19.6 Tạo Employee Payroll page
    - Tạo file `company/employees/[id]/payroll/page.tsx`
    - Payroll của employee cụ thể
    - _Requirements: 9.1_

- [x] 20. Responsive Design
  - [x] 20.1 Implement mobile check-in UI
    - Large tappable button
    - Simplified layout
    - _Requirements: 13.1, 13.2_

  - [x] 20.2 Implement mobile navigation
    - Hamburger menu
    - Bottom navigation for key actions
    - _Requirements: 13.3_

  - [x] 20.3 Implement responsive tables
    - Horizontal scroll
    - Card view on mobile
    - _Requirements: 13.4_

  - [x] 20.4 Implement responsive forms
    - Vertical stacking
    - Full-width inputs
    - _Requirements: 13.5_

- [x] 21. Sidebar Navigation
  - [x] 21.1 Update Company Sidebar
    - Thêm menu items cho attendance, payroll, schedules
    - Thêm menu items cho holidays, leave, reports
    - _Requirements: All_

  - [x] 21.2 Update Employee Sidebar
    - Thêm menu items cho attendance, schedule, payroll, leave
    - _Requirements: All_

- [x] 22. Final Checkpoint
  - Ensure all pages work and tests pass, ask the user if questions arise.

- [x] 23. Break Time Configuration UI
  - [x] 23.1 Tạo BreakConfigForm component
    - Tạo file `company/settings/_break-config-form.tsx`
    - Toggle enable/disable break
    - Radio buttons for break type (Paid/Unpaid)
    - Input fields for min/max break duration
    - Toggle for legal minimum vs custom
    - Toggle for break tracking
    - Locale selector
    - Toggle for fixed break mode
    - Input for number of break periods
    - Break period configuration (start/end time for each)
    - Night shift configuration section (start/end time, minimum break)
    - _Requirements: 15.1-15.17_

  - [x] 23.2 Cập nhật SettingsTabs để thêm Break tab
    - Thêm Break tab vào settings tabs
    - _Requirements: 1.1, 15.1_

- [x] 24. Break Time in Work Schedule Form
  - [x] 24.1 Cập nhật ScheduleForm để thêm break periods
    - Section cho break periods
    - Add/remove break periods
    - Time pickers cho start/end
    - Toggle flexible vs fixed
    - Total break calculation
    - Validation
    - Support overnight schedules (17:00 to 07:00)
    - Support break periods spanning midnight
    - _Requirements: 16.1-16.11_

- [x] 25. Break Timer Component
  - [x] 25.1 Tạo BreakTimer component
    - Tạo file `employee/attendance/_break-timer.tsx`
    - Start/End break buttons
    - Real-time duration display
    - Remaining time display
    - Warning when exceeds max
    - Hide when fixed break mode
    - _Requirements: 17.1-17.10_

  - [x] 25.2 Tích hợp BreakTimer vào CheckInSection
    - Hiển thị break timer sau khi check-in
    - _Requirements: 17.8_

- [x] 26. Break History View
  - [x] 26.1 Tạo BreakHistory component
    - Tạo file `employee/attendance/_break-history.tsx`
    - List break records
    - Start/end time, duration
    - Total break time
    - Compliance indicator
    - _Requirements: 18.1-18.6_

  - [x] 26.2 Tích hợp BreakHistory vào AttendanceDayDetail
    - Hiển thị break history trong attendance detail
    - _Requirements: 18.5_

- [x] 27. Break Summary in Attendance
  - [x] 27.1 Cập nhật AttendanceRecord display
    - Thêm break duration column
    - Thêm break type display
    - Thêm compliance status
    - Thêm net working hours
    - _Requirements: 19.1-19.6_

  - [x] 27.2 Cập nhật AttendanceTable
    - Thêm break column
    - Warning indicator cho non-compliant
    - _Requirements: 19.5, 19.6_

- [x] 28. Break Reports
  - [x] 28.1 Tạo BreakReport components
    - Tạo file `company/reports/break/page.tsx`
    - Daily break report
    - Monthly break report
    - Compliance rate display
    - Non-compliant highlight
    - Export to CSV
    - _Requirements: 20.1-20.7_

- [x] 29. Break i18n Messages
  - [x] 29.1 Thêm namespace break vào messages
    - Labels cho break config form
    - Break type labels (Paid/Unpaid)
    - Legal requirement descriptions
    - Error messages
    - Report headers
    - _Requirements: 14.1-14.6 (break related)_

- [x] 30. Break API Client Functions
  - [x] 30.1 Tạo Break API functions
    - Tạo file `lib/apis/break-api.ts`
    - updateBreakConfig
    - startBreak, endBreak
    - getBreakRecords, getBreakSummary
    - getBreakReport
    - _Requirements: 15-20_

- [x] 31. Final Checkpoint - Break Time
  - Ensure all break time features work and tests pass, ask the user if questions arise.

- [x] 32. Overtime Configuration UI
  - [x] 32.1 Cập nhật OvertimeConfigForm component
    - Cập nhật file `company/settings/_overtime-config-form.tsx`
    - Toggle enable/disable overtime
    - Input for standard working hours (default: 8)
    - Time pickers for night shift start/end times
    - Input fields for overtime multipliers:
      - Regular overtime rate (default: 1.25)
      - Night work rate (default: 1.25)
      - Night overtime rate (default: 1.50)
      - Holiday overtime rate (default: 1.35)
      - Holiday night overtime rate (default: 1.60)
    - Toggle for legal minimum vs custom multipliers
    - Locale selector (Japan, Vietnam)
    - Display legal minimum values based on locale
    - Validation: custom multipliers >= legal minimum
    - Preview section showing sample calculation
    - _Requirements: 21.1-21.13_

  - [x] 32.2 Tạo OvertimeMultiplierInput component
    - Tạo file `company/settings/_overtime-multiplier-input.tsx`
    - Input với legal minimum indicator
    - Validation error display
    - _Requirements: 21.4, 21.8, 21.9_

  - [x] 32.3 Tạo OvertimePreview component
    - Tạo file `company/settings/_overtime-preview.tsx`
    - Sample calculation với hourly rate
    - Show breakdown by overtime type
    - _Requirements: 21.12_

- [x] 33. Overtime Summary in Payslip
  - [x] 33.1 Tạo OvertimeBreakdown component
    - Tạo file `employee/payroll/_overtime-breakdown.tsx`
    - Display regular hours, overtime hours
    - Display night hours, night overtime hours
    - Display holiday hours (if applicable)
    - Show multiplier for each type
    - Show amount for each type
    - Total overtime amount
    - Collapsible/expandable section
    - _Requirements: 22.1-22.6_

  - [x] 33.2 Cập nhật PayslipView để tích hợp OvertimeBreakdown
    - Thêm overtime section vào payslip
    - _Requirements: 22.1_

- [x] 34. Overtime Summary in Attendance
  - [x] 34.1 Cập nhật AttendanceRecord display
    - Thêm overtime hours column
    - Thêm night hours column
    - _Requirements: 23.1, 23.2, 23.3_

  - [x] 34.2 Cập nhật AttendanceDayDetail
    - Thêm breakdown: regular/night/overtime hours
    - Handle overnight shifts correctly
    - _Requirements: 23.4, 23.5_

  - [x] 34.3 Cập nhật AttendanceTable
    - Thêm overtime column
    - _Requirements: 23.3_

- [x] 35. Overtime i18n Messages
  - [x] 35.1 Thêm overtime messages vào namespace
    - Labels cho overtime config form
    - Multiplier labels
    - Legal minimum descriptions by locale
    - Overtime breakdown labels
    - Error messages
    - _Requirements: 14.1-14.6 (overtime related), 21.1-21.13_

- [x] 36. Overtime API Client Functions
  - [x] 36.1 Cập nhật Company Settings API
    - Cập nhật file `lib/apis/company-settings-api.ts`
    - updateOvertimeConfig
    - getOvertimeConfig
    - getLegalOvertimeMinimums
    - _Requirements: 21.1-21.13_

- [x] 37. Final Checkpoint - Overtime
  - Ensure all overtime features work and tests pass, ask the user if questions arise.

- [x] 38. Multiple Breaks Timeline Components
  - [x] 38.1 Tạo BreakTimeline component
    - Tạo file `employee/attendance/_break-timeline.tsx`
    - Vertical timeline layout
    - Order breaks by breakNumber ascending
    - Show total break time summary
    - Show compliance status
    - _Requirements: 24.1-24.6_

  - [x] 38.2 Tạo BreakCard component
    - Tạo file `employee/attendance/_break-card.tsx`
    - Display breakNumber, start/end time, duration
    - Highlight active break với different color
    - Show "Đang nghỉ" status for active break
    - Clickable for adjustment
    - _Requirements: 24.2, 24.4_

  - [x] 38.3 Cập nhật BreakTimer cho Multiple Sessions
    - Cập nhật file `employee/attendance/_break-timer.tsx`
    - Show current break count (e.g., "Lần nghỉ 2/3")
    - Disable start button when maxBreaksPerDay reached
    - Show message "Đã đạt giới hạn số lần nghỉ trong ngày"
    - _Requirements: 25.1-25.6_

  - [x] 38.4 Tạo BreakAdjustmentDialog component
    - Tạo file `employee/attendance/_break-adjustment-dialog.tsx`
    - Pre-fill with selected break's times
    - Include breakRecordId in request
    - Show breakNumber being adjusted
    - Validate no overlap with other breaks
    - _Requirements: 26.1-26.6_

  - [x] 38.5 Write property test cho Break Timeline Order
    - **Property 7: Break Timeline Order Consistency**
    - **Validates: Requirements 24.3**

  - [x] 38.6 Write property test cho Break Non-Overlap
    - **Property 8: Break Session Non-Overlap**
    - **Validates: Requirements 26.6**

  - [x] 38.7 Write property test cho Max Breaks Enforcement
    - **Property 9: Max Breaks Per Day Enforcement**
    - **Validates: Requirements 25.3**

- [x] 39. Multiple Breaks Report Components
  - [x] 39.1 Tạo BreakReportExpandable component
    - Tạo file `company/reports/break/_break-report-expandable.tsx`
    - Expandable row showing all break sessions
    - Timeline view when expanded
    - Total break time calculation
    - _Requirements: 27.1-27.4_

  - [x] 39.2 Cập nhật BreakReport page
    - Cập nhật file `company/reports/break/page.tsx`
    - Add expandable break sessions column
    - Add compliance filter
    - Highlight non-compliant employees
    - _Requirements: 27.2, 27.5, 27.6_

- [x] 40. Multiple Breaks Responsive Design
  - [x] 40.1 Implement responsive timeline
    - Vertical stack on mobile
    - Compact break cards
    - Expandable details
    - Min 44px touch targets
    - _Requirements: 28.1-28.4_

  - [x] 40.2 Implement swipe navigation
    - Swipe gestures for day navigation
    - _Requirements: 28.5_

- [x] 41. Multiple Breaks i18n Messages
  - [x] 41.1 Thêm multiple breaks messages
    - Timeline labels
    - Break count messages (e.g., "Lần nghỉ 2/3")
    - Max breaks reached message
    - Adjustment dialog labels
    - Compliance status labels
    - _Requirements: 24-28 (i18n related)_

- [x] 42. Multiple Breaks API Updates
  - [x] 42.1 Cập nhật Break API functions
    - Cập nhật file `lib/apis/break-api.ts`
    - startBreak returns breakNumber
    - getBreakRecords returns array with breakNumber
    - createBreakAdjustment includes breakRecordId
    - _Requirements: 24-27_

- [x] 43. Tích hợp Timeline vào Attendance Pages
  - [x] 43.1 Cập nhật AttendanceDayDetail
    - Thay thế BreakHistory bằng BreakTimeline
    - Tích hợp BreakTimer với multiple sessions
    - _Requirements: 24.1_

  - [x] 43.2 Cập nhật AttendanceDetail (Company view)
    - Hiển thị BreakTimeline cho employee
    - _Requirements: 24.1_

- [x] 44. Final Checkpoint - Multiple Breaks
  - Ensure all multiple breaks features work and tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Sử dụng fast-check library cho property-based testing
- Sử dụng Vitest cho unit tests
- Tất cả text phải qua i18n translation
