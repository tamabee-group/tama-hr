# Design Document: Attendance & Payroll Frontend System

## Overview

Giao diện người dùng cho hệ thống chấm công và tính lương, xây dựng trên Next.js 16 App Router với TypeScript. Hỗ trợ đa ngôn ngữ (vi, en, ja), responsive design, và tích hợp với Backend API.

### Design Principles

1. **Component Reusability**: Tách components theo chức năng, tái sử dụng tối đa
2. **Type Safety**: Sử dụng TypeScript strict mode
3. **i18n First**: Tất cả text đều qua translation
4. **Mobile First**: Thiết kế responsive từ mobile lên
5. **Optimistic UI**: Cập nhật UI trước khi API response

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Pages (Server Components)               │
├─────────────────────────────────────────────────────────────────┤
│  /company/settings  │  /company/attendance  │  /company/payroll │
│  /employee/attendance  │  /employee/payroll  │  /employee/leave │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Page Content (Client Components)             │
├─────────────────────────────────────────────────────────────────┤
│  _settings-tabs.tsx  │  _attendance-page.tsx  │  _payroll-dashboard.tsx │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Shared Components                         │
├─────────────────────────────────────────────────────────────────┤
│  _check-in-button.tsx  │  _payslip-card.tsx  │  _schedule-selector.tsx │
│  _adjustment-dialog.tsx  │  _approval-list.tsx  │  _calendar-view.tsx │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Base Components                         │
├─────────────────────────────────────────────────────────────────┤
│  BaseTable  │  BaseSidebar  │  BaseDialog  │  BaseForm          │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Settings Components

```typescript
// _settings-tabs.tsx
interface SettingsTabsProps {
  initialSettings: CompanySettings;
}

// Tab components
interface AttendanceConfigFormProps {
  config: AttendanceConfig;
  onSave: (config: AttendanceConfig) => Promise<void>;
}

interface PayrollConfigFormProps {
  config: PayrollConfig;
  onSave: (config: PayrollConfig) => Promise<void>;
}

interface OvertimeConfigFormProps {
  config: OvertimeConfig;
  onSave: (config: OvertimeConfig) => Promise<void>;
}

interface AllowanceConfigFormProps {
  config: AllowanceConfig;
  onSave: (config: AllowanceConfig) => Promise<void>;
}

interface DeductionConfigFormProps {
  config: DeductionConfig;
  onSave: (config: DeductionConfig) => Promise<void>;
}
```

### 2. Attendance Components

```typescript
// _check-in-button.tsx
interface CheckInButtonProps {
  status: "not_checked_in" | "checked_in" | "checked_out";
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  requireLocation?: boolean;
}

// _attendance-calendar.tsx
interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  month: Date;
  onDateClick: (date: Date) => void;
  onMonthChange: (month: Date) => void;
}

// _attendance-record-card.tsx
interface AttendanceRecordCardProps {
  record: AttendanceRecord;
  onRequestAdjustment: () => void;
}

// _adjustment-dialog.tsx
interface AdjustmentDialogProps {
  record: AttendanceRecord;
  open: boolean;
  onClose: () => void;
  onSubmit: (request: AdjustmentRequest) => Promise<void>;
}
```

### 3. Schedule Components

```typescript
// _schedule-form.tsx
interface ScheduleFormProps {
  schedule?: WorkSchedule;
  onSave: (schedule: WorkScheduleInput) => Promise<void>;
  onCancel: () => void;
}

// _schedule-selector.tsx
interface ScheduleSelectorProps {
  availableSchedules: WorkSchedule[];
  suggestedSchedules: WorkSchedule[];
  currentSchedule?: WorkSchedule;
  onSelect: (scheduleId: number, dateRange: DateRange) => Promise<void>;
}

// _schedule-assignment-dialog.tsx
interface ScheduleAssignmentDialogProps {
  schedule: WorkSchedule;
  employees: Employee[];
  onAssign: (employeeIds: number[]) => Promise<void>;
}
```

### 4. Payroll Components

```typescript
// _payroll-dashboard.tsx
interface PayrollDashboardProps {
  period: YearMonth;
  summary: PayrollSummary;
  status: PayrollStatus;
}

// _payroll-preview-table.tsx
interface PayrollPreviewTableProps {
  records: PayrollPreviewRecord[];
  onFinalize: () => Promise<void>;
}

// _payslip-view.tsx
interface PayslipViewProps {
  payroll: PayrollRecord;
  onDownloadPdf: () => Promise<void>;
}

// _payment-status-table.tsx
interface PaymentStatusTableProps {
  records: PayrollRecord[];
  onPayAll: () => Promise<void>;
  onRetry: (recordId: number) => Promise<void>;
}
```

### 5. Approval Components

```typescript
// _approval-list.tsx
interface ApprovalListProps {
  requests: AdjustmentRequest[];
  onApprove: (requestId: number, comment?: string) => Promise<void>;
  onReject: (requestId: number, reason: string) => Promise<void>;
  onBulkApprove: (requestIds: number[]) => Promise<void>;
  onBulkReject: (requestIds: number[], reason: string) => Promise<void>;
}

// _leave-approval-list.tsx
interface LeaveApprovalListProps {
  requests: LeaveRequest[];
  onApprove: (requestId: number) => Promise<void>;
  onReject: (requestId: number, reason: string) => Promise<void>;
}
```

### 6. Report Components

```typescript
// _report-generator.tsx
interface ReportGeneratorProps {
  reportType: "attendance" | "payroll" | "leave" | "break";
  onGenerate: (filters: ReportFilters) => Promise<ReportData>;
  onExportCsv: () => Promise<void>;
  onExportPdf: () => Promise<void>;
}

// _report-chart.tsx
interface ReportChartProps {
  data: ChartData;
  type: "bar" | "line" | "pie";
}
```

### 7. Break Time Components

```typescript
// _break-config-form.tsx
interface BreakConfigFormProps {
  config: BreakConfig;
  onSave: (config: BreakConfig) => Promise<void>;
}

// _break-timer.tsx
interface BreakTimerProps {
  attendanceRecordId: number;
  breakConfig: BreakConfig;
  currentBreak?: BreakRecord;
  onStartBreak: () => Promise<void>;
  onEndBreak: (breakRecordId: number) => Promise<void>;
}

// _break-history.tsx
interface BreakHistoryProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  minimumRequired: number;
  isCompliant: boolean;
}

// _break-period-form.tsx
interface BreakPeriodFormProps {
  periods: BreakPeriod[];
  onChange: (periods: BreakPeriod[]) => void;
  maxPeriods: number;
  workStartTime: string;
  workEndTime: string;
}

// _break-report.tsx
interface BreakReportProps {
  reportType: "daily" | "monthly";
  data: BreakReportData;
  onExportCsv: () => Promise<void>;
}
```

### 8. Overtime Config Components

```typescript
// _overtime-config-form.tsx
interface OvertimeConfigFormProps {
  config: OvertimeConfig;
  legalMinimums: LegalOvertimeMinimums;
  onSave: (config: OvertimeConfig) => Promise<void>;
}

// _overtime-multiplier-input.tsx
interface OvertimeMultiplierInputProps {
  label: string;
  value: number;
  legalMinimum: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

// _overtime-preview.tsx
interface OvertimePreviewProps {
  config: OvertimeConfig;
  sampleHourlyRate: number;
}

// _overtime-breakdown.tsx (for payslip)
interface OvertimeBreakdownProps {
  regularMinutes: number;
  regularOvertimeMinutes: number;
  nightMinutes: number;
  nightOvertimeMinutes: number;
  holidayMinutes?: number;
  holidayNightMinutes?: number;
  regularOvertimeAmount: number;
  nightWorkAmount: number;
  nightOvertimeAmount: number;
  holidayOvertimeAmount?: number;
  holidayNightOvertimeAmount?: number;
  totalOvertimeAmount: number;
  multipliers: OvertimeMultipliers;
}
```

### 9. Multiple Breaks Timeline Components

```typescript
// _break-timeline.tsx
interface BreakTimelineProps {
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  minimumRequired: number;
  maxBreaksPerDay: number;
  isCompliant: boolean;
  onBreakClick?: (breakRecord: BreakRecord) => void;
}

// _break-card.tsx
interface BreakCardProps {
  breakRecord: BreakRecord;
  isActive: boolean;
  onClick?: () => void;
}

// _break-timer-multi.tsx (updated for multiple breaks)
interface BreakTimerMultiProps {
  attendanceRecordId: number;
  breakConfig: BreakConfig;
  breakRecords: BreakRecord[];
  activeBreak?: BreakRecord;
  maxBreaksPerDay: number;
  onStartBreak: () => Promise<void>;
  onEndBreak: (breakRecordId: number) => Promise<void>;
}

// _break-adjustment-dialog.tsx
interface BreakAdjustmentDialogProps {
  breakRecord: BreakRecord;
  open: boolean;
  onClose: () => void;
  onSubmit: (request: BreakAdjustmentRequest) => Promise<void>;
}

// _break-report-expandable.tsx
interface BreakReportExpandableProps {
  employeeId: number;
  employeeName: string;
  breakRecords: BreakRecord[];
  totalBreakMinutes: number;
  isCompliant: boolean;
  expanded: boolean;
  onToggle: () => void;
}
```

## Data Models (TypeScript Types)

### Configuration Types

```typescript
interface AttendanceConfig {
  defaultWorkStartTime: string; // "09:00"
  defaultWorkEndTime: string; // "18:00"
  defaultBreakMinutes: number;
  enableRounding: boolean;
  checkInRounding?: RoundingConfig;
  checkOutRounding?: RoundingConfig;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  requireDeviceRegistration: boolean;
  requireGeoLocation: boolean;
  geoFenceRadiusMeters: number;
  allowMobileCheckIn: boolean;
  allowWebCheckIn: boolean;
}

interface BreakConfig {
  breakEnabled: boolean;
  breakType: BreakType;
  defaultBreakMinutes: number;
  minimumBreakMinutes: number;
  maximumBreakMinutes: number;
  useLegalMinimum: boolean;
  breakTrackingEnabled: boolean;
  locale: string;
  fixedBreakMode: boolean;
  breakPeriodsPerAttendance: number;
  fixedBreakPeriods: BreakPeriod[];
  maxBreaksPerDay: number; // Giới hạn số lần nghỉ trong ngày
  // Night shift configuration
  nightShiftStartTime: string; // "22:00"
  nightShiftEndTime: string; // "05:00"
  nightShiftMinimumBreakMinutes: number;
  nightShiftDefaultBreakMinutes: number;
}

interface BreakPeriod {
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isFlexible: boolean;
  order: number;
}

interface BreakRecord {
  id: number;
  attendanceRecordId: number;
  employeeId: number;
  workDate: string;
  breakNumber: number; // 1, 2, 3... cho multiple breaks
  breakStart?: string;
  breakEnd?: string;
  actualBreakMinutes: number;
  effectiveBreakMinutes: number;
  notes?: string;
}

interface BreakAdjustmentRequest {
  breakRecordId: number;
  requestedBreakStart?: string;
  requestedBreakEnd?: string;
  reason: string;
}

interface RoundingConfig {
  interval: RoundingInterval;
  direction: RoundingDirection;
}

interface PayrollConfig {
  defaultSalaryType: SalaryType;
  payDay: number;
  cutoffDay: number;
  salaryRounding: RoundingDirection;
  standardWorkingDaysPerMonth: number;
  standardWorkingHoursPerDay: number;
}

interface OvertimeConfig {
  overtimeEnabled: boolean;
  standardWorkingHours: number;
  nightStartTime: string; // "22:00"
  nightEndTime: string; // "05:00"
  // Overtime multipliers - có thể cấu hình linh hoạt
  regularOvertimeRate: number; // default: 1.25
  nightWorkRate: number; // default: 1.25
  nightOvertimeRate: number; // default: 1.50
  holidayOvertimeRate: number; // default: 1.35
  holidayNightOvertimeRate: number; // default: 1.60
  useLegalMinimum: boolean;
  locale: string; // "ja" | "vi"
  requireApproval: boolean;
  maxOvertimeHoursPerDay: number;
  maxOvertimeHoursPerMonth: number;
}

interface OvertimeMultipliers {
  regularOvertime: number;
  nightWork: number;
  nightOvertime: number;
  holidayOvertime: number;
  holidayNightOvertime: number;
}

interface LegalOvertimeMinimums {
  ja: OvertimeMultipliers;
  vi: OvertimeMultipliers;
  default: OvertimeMultipliers;
}

interface AllowanceConfig {
  allowances: AllowanceRule[];
}

interface AllowanceRule {
  code: string;
  name: string;
  type: AllowanceType;
  amount: number;
  taxable: boolean;
  condition?: AllowanceCondition;
}

interface DeductionConfig {
  deductions: DeductionRule[];
  enableLatePenalty: boolean;
  latePenaltyPerMinute: number;
  enableEarlyLeavePenalty: boolean;
  earlyLeavePenaltyPerMinute: number;
  enableAbsenceDeduction: boolean;
}

interface DeductionRule {
  code: string;
  name: string;
  type: DeductionType;
  amount?: number;
  percentage?: number;
  order: number;
}
```

### Record Types

```typescript
interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  workDate: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  roundedCheckIn?: string;
  roundedCheckOut?: string;
  workingMinutes: number;
  overtimeMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status: AttendanceStatus;
}

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  year: number;
  month: number;
  salaryType: SalaryType;
  baseSalary: number;
  // Overtime breakdown
  regularMinutes: number;
  regularOvertimeMinutes: number;
  nightMinutes: number;
  nightOvertimeMinutes: number;
  holidayMinutes?: number;
  holidayNightMinutes?: number;
  regularOvertimePay: number;
  nightWorkPay: number;
  nightOvertimePay: number;
  holidayOvertimePay: number;
  holidayNightOvertimePay: number;
  totalOvertimePay: number;
  // Break info
  totalBreakMinutes: number;
  breakType: BreakType;
  breakDeductionAmount: number;
  // Allowances & Deductions
  allowanceDetails: AllowanceItem[];
  totalAllowances: number;
  deductionDetails: DeductionItem[];
  totalDeductions: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  paymentStatus: PaymentStatus;
  paidAt?: string;
}

interface AdjustmentRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  attendanceRecordId: number;
  workDate: string;
  originalCheckIn?: string;
  originalCheckOut?: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: AdjustmentStatus;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface WorkSchedule {
  id: number;
  companyId: number;
  name: string;
  type: ScheduleType;
  isDefault: boolean;
  scheduleData: ScheduleData;
  assignmentCount: number;
}

interface ScheduleSelection {
  id: number;
  employeeId: number;
  scheduleId: number;
  scheduleName: string;
  effectiveFrom: string;
  effectiveTo: string;
  status: SelectionStatus;
}
```

### Enums

```typescript
const RoundingInterval = {
  MINUTES_5: "MINUTES_5",
  MINUTES_10: "MINUTES_10",
  MINUTES_15: "MINUTES_15",
  MINUTES_30: "MINUTES_30",
  MINUTES_60: "MINUTES_60",
} as const;

const RoundingDirection = {
  UP: "UP",
  DOWN: "DOWN",
  NEAREST: "NEAREST",
} as const;

const SalaryType = {
  MONTHLY: "MONTHLY",
  DAILY: "DAILY",
  HOURLY: "HOURLY",
} as const;

const AttendanceStatus = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LEAVE: "LEAVE",
  HOLIDAY: "HOLIDAY",
} as const;

const PayrollStatus = {
  DRAFT: "DRAFT",
  FINALIZED: "FINALIZED",
  PAID: "PAID",
} as const;

const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
} as const;

const AdjustmentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

const ScheduleType = {
  FIXED: "FIXED",
  FLEXIBLE: "FLEXIBLE",
  SHIFT: "SHIFT",
} as const;

const SelectionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

const AllowanceType = {
  FIXED: "FIXED",
  CONDITIONAL: "CONDITIONAL",
  ONE_TIME: "ONE_TIME",
} as const;

const DeductionType = {
  FIXED: "FIXED",
  PERCENTAGE: "PERCENTAGE",
} as const;

const BreakType = {
  PAID: "PAID",
  UNPAID: "UNPAID",
} as const;
```

## Page Structure

```
src/app/[locale]/(AdminLayout)/
├── company/
│   ├── settings/
│   │   ├── page.tsx
│   │   ├── _settings-tabs.tsx
│   │   ├── _attendance-config-form.tsx
│   │   ├── _payroll-config-form.tsx
│   │   ├── _overtime-config-form.tsx
│   │   ├── _allowance-config-form.tsx
│   │   └── _deduction-config-form.tsx
│   ├── schedules/
│   │   ├── page.tsx                      # Danh sách schedules
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Chi tiết schedule
│   │   ├── _schedule-table.tsx
│   │   ├── _schedule-form.tsx
│   │   ├── _schedule-detail.tsx
│   │   └── _schedule-assignment-dialog.tsx
│   ├── attendance/
│   │   ├── page.tsx                      # Danh sách attendance
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Chi tiết attendance record
│   │   ├── _attendance-table.tsx
│   │   ├── _attendance-detail.tsx
│   │   └── _attendance-filters.tsx
│   ├── employees/
│   │   ├── page.tsx                      # Danh sách employees
│   │   ├── [id]/
│   │   │   ├── page.tsx                  # Chi tiết employee
│   │   │   ├── attendance/
│   │   │   │   └── page.tsx              # Attendance của employee
│   │   │   └── payroll/
│   │   │       └── page.tsx              # Payroll của employee
│   │   ├── _employee-table.tsx
│   │   └── _employee-detail.tsx
│   ├── adjustments/
│   │   ├── page.tsx                      # Danh sách adjustment requests
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Chi tiết adjustment request
│   │   ├── _approval-list.tsx
│   │   └── _adjustment-detail.tsx
│   ├── payroll/
│   │   ├── page.tsx                      # Payroll dashboard
│   │   ├── [period]/
│   │   │   └── page.tsx                  # Chi tiết payroll period (YYYY-MM)
│   │   ├── records/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Chi tiết payroll record
│   │   ├── _payroll-dashboard.tsx
│   │   ├── _payroll-preview-table.tsx
│   │   ├── _payroll-period-detail.tsx
│   │   ├── _payroll-record-detail.tsx
│   │   └── _payment-status-table.tsx
│   ├── holidays/
│   │   ├── page.tsx                      # Danh sách holidays
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Chi tiết/edit holiday
│   │   ├── _holiday-table.tsx
│   │   └── _holiday-form.tsx
│   ├── leave-requests/
│   │   ├── page.tsx                      # Danh sách leave requests
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Chi tiết leave request
│   │   ├── _leave-approval-list.tsx
│   │   └── _leave-request-detail.tsx
│   └── reports/
│       ├── page.tsx                      # Report generator
│       ├── attendance/
│       │   └── page.tsx                  # Attendance report
│       ├── payroll/
│       │   └── page.tsx                  # Payroll report
│       ├── _report-generator.tsx
│       └── _report-chart.tsx
├── employee/
│   ├── attendance/
│   │   ├── page.tsx                      # My attendance
│   │   ├── [date]/
│   │   │   └── page.tsx                  # Chi tiết attendance ngày cụ thể
│   │   ├── _check-in-section.tsx
│   │   ├── _attendance-calendar.tsx
│   │   ├── _attendance-history.tsx
│   │   ├── _attendance-day-detail.tsx
│   │   └── _adjustment-dialog.tsx
│   ├── schedule/
│   │   ├── page.tsx                      # My schedule
│   │   ├── _schedule-selector.tsx
│   │   └── _my-schedule-view.tsx
│   ├── payroll/
│   │   ├── page.tsx                      # My payslips
│   │   ├── [period]/
│   │   │   └── page.tsx                  # Chi tiết payslip (YYYY-MM)
│   │   ├── _payslip-list.tsx
│   │   └── _payslip-view.tsx
│   ├── leave/
│   │   ├── page.tsx                      # My leave
│   │   ├── [id]/
│   │   │   └── page.tsx                  # Chi tiết leave request
│   │   ├── _leave-balance.tsx
│   │   ├── _leave-request-form.tsx
│   │   ├── _leave-history.tsx
│   │   └── _leave-request-detail.tsx
│   └── adjustments/
│       ├── page.tsx                      # My adjustment requests
│       ├── [id]/
│       │   └── page.tsx                  # Chi tiết adjustment request
│       ├── _my-adjustments.tsx
│       └── _adjustment-detail.tsx
└── _components/
    └── _shared/
        ├── _notification-bell.tsx
        ├── _calendar-view.tsx
        ├── _status-badge.tsx
        ├── _time-display.tsx
        └── _currency-display.tsx
```

## Detail Page Components

### Schedule Detail

```typescript
// _schedule-detail.tsx
interface ScheduleDetailProps {
  schedule: WorkSchedule;
  assignments: ScheduleAssignment[];
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
}
```

### Attendance Detail

```typescript
// _attendance-detail.tsx
interface AttendanceDetailProps {
  record: AttendanceRecord;
  schedule: WorkSchedule;
  adjustmentHistory: AdjustmentRequest[];
  onRequestAdjustment: () => void;
}

// _attendance-day-detail.tsx (Employee view)
interface AttendanceDayDetailProps {
  date: Date;
  record?: AttendanceRecord;
  schedule: WorkSchedule;
  onRequestAdjustment: () => void;
}
```

### Employee Detail

```typescript
// _employee-detail.tsx
interface EmployeeDetailProps {
  employee: Employee;
  currentSchedule?: WorkSchedule;
  attendanceSummary: AttendanceSummary;
  leaveBalance: LeaveBalance[];
  onViewAttendance: () => void;
  onViewPayroll: () => void;
  onAssignSchedule: () => void;
}
```

### Adjustment Detail

```typescript
// _adjustment-detail.tsx
interface AdjustmentDetailProps {
  request: AdjustmentRequest;
  attendanceRecord: AttendanceRecord;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}
```

### Payroll Period Detail

```typescript
// _payroll-period-detail.tsx
interface PayrollPeriodDetailProps {
  period: YearMonth;
  summary: PayrollSummary;
  records: PayrollRecord[];
  status: PayrollStatus;
  onFinalize: () => Promise<void>;
  onPayAll: () => Promise<void>;
  onSendNotifications: () => Promise<void>;
  onExportCsv: () => Promise<void>;
  onExportPdf: () => Promise<void>;
}

// _payroll-record-detail.tsx
interface PayrollRecordDetailProps {
  record: PayrollRecord;
  attendanceSummary: AttendanceSummary;
  onDownloadPayslip: () => Promise<void>;
}
```

### Leave Request Detail

```typescript
// _leave-request-detail.tsx
interface LeaveRequestDetailProps {
  request: LeaveRequest;
  employee: Employee;
  leaveBalance: LeaveBalance;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onCancel: () => Promise<void>; // For employee to cancel pending request
}
```

### Holiday Form

```typescript
// _holiday-form.tsx
interface HolidayFormProps {
  holiday?: Holiday;
  onSave: (holiday: HolidayInput) => Promise<void>;
  onCancel: () => void;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Form Validation Consistency

_For any_ settings form with valid input values, submitting the form SHALL succeed and display a success message. _For any_ settings form with invalid input values, submitting SHALL fail and display appropriate error messages.

**Validates: Requirements 1.3**

### Property 2: Schedule Time Validation

_For any_ work schedule form, the system SHALL reject submissions where start time is not before end time.

**Validates: Requirements 2.3**

### Property 3: Payroll Breakdown Sum Invariant

_For any_ payslip view, the displayed gross salary SHALL equal (base salary + total overtime pay + total allowances), and net salary SHALL equal (gross salary - total deductions).

**Validates: Requirements 7.4, 9.3**

### Property 4: i18n Translation Completeness

_For any_ supported locale (vi, en, ja), all translation keys used in the application SHALL have corresponding translations in the message file.

**Validates: Requirements 14.1, 14.2**

### Property 5: Attendance Status Consistency

_For any_ attendance record displayed, the status (late, early departure) SHALL be consistent with the check-in/check-out times and the configured grace periods.

**Validates: Requirements 3.5**

### Property 6: Notification Count Accuracy

_For any_ notification bell display, the unread count SHALL equal the number of unread notifications in the notification list.

**Validates: Requirements 12.1**

### Property 7: Break Timeline Order Consistency

_For any_ break timeline display, the break cards SHALL be ordered by breakNumber ascending, and breakNumber SHALL be sequential starting from 1.

**Validates: Requirements 24.3**

### Property 8: Break Session Non-Overlap

_For any_ set of break records for a single attendance, no two completed breaks SHALL have overlapping time ranges.

**Validates: Requirements 26.6**

### Property 9: Max Breaks Per Day Enforcement

_For any_ attendance record, the number of break records SHALL NOT exceed maxBreaksPerDay configured in BreakConfig.

**Validates: Requirements 25.3**

## Error Handling

### Error Display Strategy

```typescript
// Toast notifications for API errors
const handleApiError = (error: ApiError, tErrors: TranslationFunction) => {
  const message = getErrorMessage(error.code, tErrors);
  toast.error(message);
};

// Form validation errors inline
const FormField = ({ error, ...props }) => (
  <div>
    <Input {...props} />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

// Loading states
const LoadingState = () => (
  <div className="flex items-center justify-center p-8">
    <Spinner />
  </div>
);

// Empty states
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center text-muted-foreground p-8">
    {message}
  </div>
);
```

### Error Codes (Frontend)

```typescript
// Attendance errors
'ATTENDANCE_001': 'Bạn đã chấm công vào hôm nay',
'ATTENDANCE_002': 'Bạn cần chấm công vào trước khi chấm công ra',
'ATTENDANCE_003': 'Thiết bị chưa được đăng ký',
'ATTENDANCE_004': 'Vị trí nằm ngoài khu vực cho phép',

// Payroll errors
'PAYROLL_001': 'Không tìm thấy bảng lương',
'PAYROLL_002': 'Bảng lương đã được chốt',

// Adjustment errors
'ADJUSTMENT_001': 'Không tìm thấy yêu cầu điều chỉnh',
'ADJUSTMENT_002': 'Yêu cầu đã được xử lý',

// Leave errors
'LEAVE_002': 'Số ngày phép không đủ',
```

## Testing Strategy

### Unit Tests

- Test form validation logic
- Test date/time formatting utilities
- Test calculation display functions
- Test component rendering with different props

### Integration Tests

- Test API integration with mock server
- Test form submission flows
- Test navigation between pages

### Property-Based Tests

Sử dụng **fast-check** library cho property-based testing:

```typescript
import fc from "fast-check";

// Property 3: Payroll Breakdown Sum Invariant
test("payroll breakdown sums correctly", () => {
  fc.assert(
    fc.property(
      fc.record({
        baseSalary: fc.nat(),
        totalOvertimePay: fc.nat(),
        totalAllowances: fc.nat(),
        totalDeductions: fc.nat(),
      }),
      (payroll) => {
        const grossSalary =
          payroll.baseSalary +
          payroll.totalOvertimePay +
          payroll.totalAllowances;
        const netSalary = grossSalary - payroll.totalDeductions;

        const displayed = calculateDisplayValues(payroll);

        expect(displayed.grossSalary).toBe(grossSalary);
        expect(displayed.netSalary).toBe(netSalary);
      },
    ),
  );
});

// Property 4: i18n Translation Completeness
test("all translation keys exist for all locales", () => {
  const locales = ["vi", "en", "ja"];
  const keys = extractAllTranslationKeys();

  fc.assert(
    fc.property(
      fc.constantFrom(...locales),
      fc.constantFrom(...keys),
      (locale, key) => {
        const translation = getTranslation(locale, key);
        expect(translation).toBeDefined();
        expect(translation).not.toBe(key); // Not falling back to key
      },
    ),
  );
});
```

### E2E Tests

- Test complete check-in/check-out flow
- Test adjustment request and approval flow
- Test payroll preview and finalization flow

### Test Configuration

- Minimum 100 iterations per property test
- Use Vitest for unit and property tests
- Use Playwright for E2E tests
- Tag format: **Feature: attendance-payroll-frontend, Property {number}: {property_text}**
