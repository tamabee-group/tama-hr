# Design Document: Flexible Workforce Management - Frontend UI

## Overview

Thiết kế giao diện người dùng cho hệ thống quản lý nhân sự linh hoạt, bao gồm:

- Unified Attendance View (attendance + break trong 1 view)
- Shift Management với swap functionality
- Employee Salary Configuration
- Payroll Period Workflow với review/approval
- Employment Contract Management
- Reports and Statistics
- Confirmation Dialogs cho các action quan trọng
- Detail Dialogs/Pages cho tất cả records

## Architecture

```
src/app/[locale]/(AdminLayout)/
├── company/
│   ├── attendance/           # Manager attendance view
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx    # Attendance detail page
│   │   ├── _attendance-table.tsx
│   │   ├── _attendance-detail-dialog.tsx
│   │   └── _attendance-filters.tsx
│   ├── shifts/               # Shift management
│   │   ├── page.tsx
│   │   ├── templates/page.tsx
│   │   ├── assignments/page.tsx
│   │   ├── swaps/page.tsx
│   │   ├── _shift-template-form.tsx
│   │   ├── _shift-assignment-dialog.tsx
│   │   ├── _shift-swap-detail-dialog.tsx
│   │   └── _swap-approval-dialog.tsx
│   ├── employees/
│   │   └── [id]/
│   │       ├── salary/page.tsx      # Employee salary config
│   │       ├── allowances/page.tsx  # Individual allowances
│   │       ├── deductions/page.tsx  # Individual deductions
│   │       └── contracts/page.tsx   # Employee contracts
│   ├── payroll/              # Payroll management
│   │   ├── page.tsx
│   │   ├── [period]/page.tsx        # Period detail
│   │   ├── _payroll-period-table.tsx
│   │   ├── _payroll-item-table.tsx
│   │   ├── _payroll-item-detail-dialog.tsx
│   │   ├── _payroll-adjustment-dialog.tsx
│   │   └── _payroll-approval-dialog.tsx
│   ├── contracts/            # Contract management
│   │   ├── page.tsx
│   │   ├── _contract-table.tsx
│   │   ├── _contract-form.tsx
│   │   ├── _contract-detail-dialog.tsx
│   │   └── _terminate-contract-dialog.tsx
│   └── reports/              # Reports
│       ├── page.tsx
│       ├── attendance/page.tsx
│       ├── overtime/page.tsx
│       ├── break-compliance/page.tsx
│       ├── payroll-summary/page.tsx
│       ├── cost-analysis/page.tsx
│       └── shift-utilization/page.tsx
└── employee/
    ├── attendance/           # Employee attendance view
    │   ├── page.tsx
    │   ├── [date]/page.tsx  # Day detail
    │   ├── _unified-attendance-card.tsx
    │   ├── _break-section.tsx
    │   ├── _attendance-calendar.tsx
    │   └── _attendance-day-detail-dialog.tsx
    └── schedule/             # Employee schedule & swap
        ├── page.tsx
        ├── _my-schedule-view.tsx
        ├── _swap-request-form.tsx
        └── _swap-request-history.tsx
```

## Components and Interfaces

### 1. Unified Attendance Components

```typescript
// Unified Attendance Card - Hiển thị check-in/out và breaks
interface UnifiedAttendanceCardProps {
  attendance: UnifiedAttendanceRecord | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onStartBreak: () => void;
  onEndBreak: (breakId: number) => void;
  isLoading: boolean;
}

// Break Section - Hiển thị danh sách breaks
interface BreakSectionProps {
  breaks: BreakRecord[];
  activeBreak: BreakRecord | null;
  breakConfig: BreakConfig;
  onStartBreak: () => void;
  onEndBreak: (breakId: number) => void;
}

// Attendance Day Detail Dialog
interface AttendanceDayDetailDialogProps {
  open: boolean;
  onClose: () => void;
  attendance: UnifiedAttendanceRecord;
  appliedSettings: AppliedSettingsSnapshot;
  adjustmentHistory: AdjustmentRequest[];
}
```

### 2. Shift Management Components

```typescript
// Shift Template Form
interface ShiftTemplateFormProps {
  template?: ShiftTemplate;
  onSubmit: (data: ShiftTemplateInput) => void;
  onCancel: () => void;
}

// Shift Assignment Dialog
interface ShiftAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  shiftTemplates: ShiftTemplate[];
  employees: Employee[];
  onAssign: (data: ShiftAssignmentInput) => void;
}

// Shift Swap Detail Dialog
interface ShiftSwapDetailDialogProps {
  open: boolean;
  onClose: () => void;
  swapRequest: ShiftSwapRequest;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

// Swap Approval Dialog (Confirmation)
interface SwapApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  swapRequest: ShiftSwapRequest;
  action: "approve" | "reject";
  onConfirm: (reason?: string) => void;
}
```

### 3. Salary Configuration Components

```typescript
// Salary Config Form
interface SalaryConfigFormProps {
  employeeId: number;
  currentConfig?: EmployeeSalaryConfig;
  onSubmit: (data: SalaryConfigInput) => void;
  onCancel: () => void;
}

// Salary Type Selector
interface SalaryTypeSelectorProps {
  value: SalaryType;
  onChange: (type: SalaryType) => void;
}

// Salary Config History
interface SalaryConfigHistoryProps {
  configs: EmployeeSalaryConfig[];
  onViewDetail: (config: EmployeeSalaryConfig) => void;
}
```

### 4. Allowance/Deduction Components

```typescript
// Allowance Assignment Form
interface AllowanceAssignmentFormProps {
  employeeId: number;
  companyAllowances: AllowanceRule[];
  existingAssignment?: EmployeeAllowance;
  onSubmit: (data: AllowanceAssignmentInput) => void;
  onCancel: () => void;
}

// Deduction Assignment Form
interface DeductionAssignmentFormProps {
  employeeId: number;
  companyDeductions: DeductionRule[];
  existingAssignment?: EmployeeDeduction;
  onSubmit: (data: DeductionAssignmentInput) => void;
  onCancel: () => void;
}

// Allowance/Deduction List
interface AllowanceDeductionListProps {
  items: (EmployeeAllowance | EmployeeDeduction)[];
  companyDefaults: (AllowanceRule | DeductionRule)[];
  onEdit: (id: number) => void;
  onDeactivate: (id: number) => void;
}
```

### 5. Payroll Components

```typescript
// Payroll Period Table
interface PayrollPeriodTableProps {
  periods: PayrollPeriod[];
  onViewDetail: (period: PayrollPeriod) => void;
  onCreatePeriod: () => void;
}

// Payroll Item Table
interface PayrollItemTableProps {
  items: PayrollItem[];
  periodStatus: PayrollPeriodStatus;
  onViewDetail: (item: PayrollItem) => void;
  onAdjust: (item: PayrollItem) => void;
}

// Payroll Item Detail Dialog
interface PayrollItemDetailDialogProps {
  open: boolean;
  onClose: () => void;
  item: PayrollItem;
  adjustmentHistory: PayrollAdjustment[];
}

// Payroll Adjustment Dialog
interface PayrollAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  item: PayrollItem;
  onSubmit: (amount: number, reason: string) => void;
}

// Payroll Approval Dialog (Confirmation)
interface PayrollApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  period: PayrollPeriod;
  action: "submit" | "approve" | "pay";
  onConfirm: (paymentReference?: string) => void;
}
```

### 6. Contract Components

```typescript
// Contract Form
interface ContractFormProps {
  employeeId: number;
  salaryConfigs: EmployeeSalaryConfig[];
  existingContract?: EmploymentContract;
  onSubmit: (data: ContractInput) => void;
  onCancel: () => void;
}

// Contract Detail Dialog
interface ContractDetailDialogProps {
  open: boolean;
  onClose: () => void;
  contract: EmploymentContract;
  linkedSalaryConfig: EmployeeSalaryConfig;
}

// Terminate Contract Dialog (Confirmation)
interface TerminateContractDialogProps {
  open: boolean;
  onClose: () => void;
  contract: EmploymentContract;
  onConfirm: (reason: string) => void;
}

// Expiring Contracts Alert
interface ExpiringContractsAlertProps {
  contracts: EmploymentContract[];
  onViewContract: (contract: EmploymentContract) => void;
}
```

### 7. Report Components

```typescript
// Report Filter Form
interface ReportFilterFormProps {
  reportType: ReportType;
  onSubmit: (filters: ReportFilters) => void;
}

// Report Table
interface ReportTableProps {
  data: ReportData;
  columns: ReportColumn[];
}

// Report Chart
interface ReportChartProps {
  data: ChartData;
  type: "bar" | "line" | "pie";
}

// Report Export Buttons
interface ReportExportButtonsProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
}
```

### 8. Confirmation Dialog Component

```typescript
// Generic Confirmation Dialog
interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant: "default" | "destructive" | "warning";
  onConfirm: () => void;
  isLoading?: boolean;
  // Optional input field
  requireInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
}
```

## Data Models

### New Types

```typescript
// Unified Attendance Record (from API)
interface UnifiedAttendanceRecord {
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
  nightMinutes: number;
  nightOvertimeMinutes: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  netWorkingMinutes: number;
  totalBreakMinutes: number;
  effectiveBreakMinutes: number;
  breakType: BreakType;
  breakCompliant: boolean;
  breakRecords: BreakRecord[]; // Embedded
  status: AttendanceStatus;
  appliedSettings: AppliedSettingsSnapshot;
  shiftInfo?: ShiftInfo;
}

// Shift Template
interface ShiftTemplate {
  id: number;
  companyId: number;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  multiplier: number;
  description?: string;
  isActive: boolean;
}

// Shift Assignment
interface ShiftAssignment {
  id: number;
  employeeId: number;
  employeeName: string;
  shiftTemplateId: number;
  shiftName: string;
  workDate: string;
  status: ShiftAssignmentStatus;
  swappedWithEmployeeId?: number;
  swappedWithEmployeeName?: string;
}

// Shift Swap Request
interface ShiftSwapRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterShift: ShiftAssignment;
  targetEmployeeId: number;
  targetEmployeeName: string;
  targetShift: ShiftAssignment;
  status: SwapRequestStatus;
  approvedBy?: number;
  approverName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

// Employee Salary Config
interface EmployeeSalaryConfig {
  id: number;
  employeeId: number;
  salaryType: SalaryType;
  monthlySalary?: number;
  dailyRate?: number;
  hourlyRate?: number;
  shiftRate?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  note?: string;
}

// Employee Allowance
interface EmployeeAllowance {
  id: number;
  employeeId: number;
  allowanceCode: string;
  allowanceName: string;
  allowanceType: AllowanceType;
  amount: number;
  taxable: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isOverride: boolean; // true if overrides company default
}

// Employee Deduction
interface EmployeeDeduction {
  id: number;
  employeeId: number;
  deductionCode: string;
  deductionName: string;
  deductionType: DeductionType;
  amount?: number;
  percentage?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  isOverride: boolean;
}

// Payroll Period
interface PayrollPeriod {
  id: number;
  companyId: number;
  periodStart: string;
  periodEnd: string;
  year: number;
  month: number;
  status: PayrollPeriodStatus;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalEmployees: number;
  createdAt: string;
  approvedAt?: string;
  paidAt?: string;
}

// Payroll Item
interface PayrollItem {
  id: number;
  payrollPeriodId: number;
  employeeId: number;
  employeeName: string;
  salaryType: SalaryType;
  baseSalary: number;
  calculatedBaseSalary: number;
  workingDays: number;
  workingHours: number;
  // Overtime breakdown
  regularOvertimeMinutes: number;
  nightOvertimeMinutes: number;
  holidayOvertimeMinutes: number;
  weekendOvertimeMinutes: number;
  totalOvertimePay: number;
  // Break
  totalBreakMinutes: number;
  breakType: BreakType;
  breakDeductionAmount: number;
  // Allowances & Deductions
  allowanceDetails: AllowanceItem[];
  totalAllowances: number;
  deductionDetails: DeductionItem[];
  totalDeductions: number;
  // Totals
  grossSalary: number;
  netSalary: number;
  // Adjustment
  adjustmentAmount?: number;
  adjustmentReason?: string;
  status: PayrollItemStatus;
}

// Employment Contract
interface EmploymentContract {
  id: number;
  employeeId: number;
  employeeName: string;
  contractType: ContractType;
  contractNumber: string;
  startDate: string;
  endDate: string;
  salaryConfigId: number;
  status: ContractStatus;
  terminationReason?: string;
  terminatedAt?: string;
  notes?: string;
  daysUntilExpiry?: number; // Calculated field
}

// New Enums
type ShiftAssignmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "SWAPPED"
  | "CANCELLED";
type SwapRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
type PayrollPeriodStatus = "DRAFT" | "REVIEWING" | "APPROVED" | "PAID";
type PayrollItemStatus = "CALCULATED" | "ADJUSTED" | "CONFIRMED";
type ContractType = "FULL_TIME" | "PART_TIME" | "SEASONAL" | "CONTRACT";
type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";
```

## Error Handling

```typescript
// Error messages for UI
const errorMessages = {
  // Shift errors
  SHIFT_TEMPLATE_NOT_FOUND: "errors.shiftTemplateNotFound",
  SHIFT_OVERLAP_EXISTS: "errors.shiftOverlapExists",
  SHIFT_SWAP_NOT_ALLOWED: "errors.shiftSwapNotAllowed",

  // Salary errors
  SALARY_CONFIG_NOT_FOUND: "errors.salaryConfigNotFound",
  INVALID_SALARY_TYPE: "errors.invalidSalaryType",

  // Payroll errors
  PAYROLL_ALREADY_APPROVED: "errors.payrollAlreadyApproved",
  PAYROLL_ALREADY_PAID: "errors.payrollAlreadyPaid",

  // Contract errors
  CONTRACT_OVERLAP_EXISTS: "errors.contractOverlapExists",
  CONTRACT_ALREADY_TERMINATED: "errors.contractAlreadyTerminated",
};
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Detail Dialog Completeness

_For any_ attendance record displayed in a detail dialog, the dialog SHALL contain all required fields: original times, rounded times, working minutes, overtime, break records, applied settings, and adjustment history (if any).

**Validates: Requirements 1.6, 2.4, 2.5**

### Property 2: Filter Accuracy

_For any_ filter combination (date range, employee, status) applied to attendance table, all displayed records SHALL match ALL specified filter criteria.

**Validates: Requirements 2.2**

### Property 3: Swap Request Detail Completeness

_For any_ shift swap request displayed in a detail dialog, the dialog SHALL contain requester info, target employee info, requester's shift details, and target's shift details.

**Validates: Requirements 4.2**

### Property 4: Salary Type Form Fields

_For any_ salary type selection (MONTHLY, DAILY, HOURLY, SHIFT_BASED), the form SHALL display the corresponding input field (monthlySalary, dailyRate, hourlyRate, shiftRate) and hide other salary fields.

**Validates: Requirements 6.3, 6.4, 6.5, 6.6**

### Property 5: Allowance/Deduction Visual Distinction

_For any_ list of employee allowances/deductions, items that override company defaults SHALL be visually distinguished from company defaults (e.g., different badge, icon, or styling).

**Validates: Requirements 7.6**

### Property 6: Payroll Item Breakdown Completeness

_For any_ payroll item displayed in a detail dialog, the dialog SHALL show: base salary calculation, overtime breakdown (regular, night, holiday, weekend), all allowances with amounts, all deductions with amounts, break deduction if applicable, adjustment history, and gross/net salary with formula.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8**

### Property 7: Locked Payroll State

_For any_ payroll period with status APPROVED or PAID, all edit actions (adjust, delete) SHALL be disabled in the UI.

**Validates: Requirements 8.9**

### Property 8: Expiring Contract Indicators

_For any_ contract with daysUntilExpiry <= 30 and status = ACTIVE, the contract row SHALL be highlighted and a notification badge SHALL be displayed.

**Validates: Requirements 10.5, 10.6**

### Property 9: Confirmation Dialog Behavior

_For any_ action that affects other users (approve/reject swap, approve/reject payroll, terminate contract, deactivate allowance/deduction), a confirmation dialog SHALL appear with: action summary, impact description, Cancel button, and Confirm button.

**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**

### Property 10: Detail Dialog Accessibility

_For any_ detail dialog, the dialog SHALL have: a close button, be dismissible by clicking outside, and be responsive on mobile devices.

**Validates: Requirements 13.5, 13.6**

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

- Test component rendering with mock data
- Test form validation
- Test conditional rendering based on props
- Test user interactions (clicks, inputs)

### Property-Based Tests (fast-check)

- Minimum 100 iterations per property test
- Use fast-check library for TypeScript property-based testing
- Each property test must reference its design document property
- Tag format: **Feature: flexible-workforce-management-ui, Property {number}: {property_text}**

### Integration Tests

- Test full user flows: check-in → break → check-out
- Test payroll workflow: create → review → approve → pay
- Test shift swap workflow: request → approve/reject

### E2E Tests (Playwright - optional)

- Test critical user journeys
- Test responsive design
- Test accessibility
