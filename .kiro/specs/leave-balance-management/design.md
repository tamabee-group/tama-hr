# Design Document

## Overview

Thiết kế tính năng quản lý số ngày nghỉ phép cho Admin/Manager công ty. Tính năng bao gồm:

- Backend API để CRUD leave balance
- Frontend page hiển thị danh sách và cho phép cập nhật
- Bulk allocation để cấp phát hàng loạt

## Architecture

### Backend Components

```
api-hr/
├── controller/company/
│   └── LeaveBalanceController.java      # API endpoints
├── dto/
│   ├── request/leave/
│   │   ├── UpdateLeaveBalanceRequest.java
│   │   └── BulkAllocateLeaveRequest.java
│   └── response/leave/
│       └── LeaveBalanceSummaryResponse.java
├── service/company/
│   ├── interfaces/ILeaveService.java    # Add new methods
│   └── impl/LeaveServiceImpl.java       # Implement new methods
└── repository/leave/
    └── LeaveBalanceRepository.java      # Add new queries
```

### Frontend Components

```
tama-hr/src/
├── app/[locale]/(DashboardLayout)/dashboard/
│   └── leave-balances/
│       ├── page.tsx                     # Server component
│       ├── _leave-balance-content.tsx   # Main content
│       ├── _leave-balance-table.tsx     # Table component
│       ├── _update-balance-dialog.tsx   # Single update dialog
│       └── _bulk-allocate-dialog.tsx    # Bulk allocation dialog
├── lib/apis/
│   └── leave-balance-api.ts             # API functions
└── messages/
    ├── vi/leaveBalance.json
    ├── en/leaveBalance.json
    └── ja/leaveBalance.json
```

## API Design

### 1. Get All Leave Balances

```
GET /api/company/leave-balances?year=2026&page=0&size=20&search=keyword
```

Response:

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "employeeId": 1,
        "employeeName": "Nguyen Van A",
        "employeeCode": "EMP001",
        "balances": [
          {
            "leaveType": "ANNUAL",
            "totalDays": 12,
            "usedDays": 3,
            "remainingDays": 9
          },
          {
            "leaveType": "SICK",
            "totalDays": 5,
            "usedDays": 1,
            "remainingDays": 4
          }
        ]
      }
    ],
    "totalElements": 50,
    "totalPages": 3
  }
}
```

### 2. Update Employee Leave Balance

```
PUT /api/company/employees/{id}/leave-balance
```

Request:

```json
{
  "year": 2026,
  "leaveType": "ANNUAL",
  "totalDays": 15
}
```

### 3. Bulk Allocate Leave Balance

```
POST /api/company/leave-balances/bulk
```

Request:

```json
{
  "year": 2026,
  "leaveType": "ANNUAL",
  "totalDays": 12,
  "employeeIds": [1, 2, 3] // empty = all employees
}
```

Response:

```json
{
  "success": true,
  "data": {
    "updatedCount": 50
  }
}
```

## Database

Sử dụng table `leave_balances` hiện có:

| Column         | Type    | Description           |
| -------------- | ------- | --------------------- |
| id             | BIGINT  | Primary key           |
| employee_id    | BIGINT  | FK to users           |
| year           | INT     | Năm                   |
| leave_type     | VARCHAR | ANNUAL, SICK          |
| total_days     | INT     | Tổng số ngày được cấp |
| used_days      | INT     | Số ngày đã sử dụng    |
| remaining_days | INT     | Số ngày còn lại       |

## UI Design

### Leave Balance Page

```
┌─────────────────────────────────────────────────────────────┐
│ Quản lý ngày phép                                           │
├─────────────────────────────────────────────────────────────┤
│ [Năm: 2026 ▼]  [🔍 Tìm kiếm...]  [+ Cấp phát hàng loạt]    │
├─────────────────────────────────────────────────────────────┤
│ STT │ Nhân viên      │ Mã NV   │ Phép năm      │ Phép ốm   │
│     │                │         │ (Cấp/Dùng/Còn)│           │
├─────────────────────────────────────────────────────────────┤
│  1  │ Nguyen Van A   │ EMP001  │ 12 / 3 / 9    │ 5 / 1 / 4 │ [✏️]
│  2  │ Tran Thi B     │ EMP002  │ 12 / 0 / 12   │ 5 / 0 / 5 │ [✏️]
└─────────────────────────────────────────────────────────────┘
```

### Update Balance Dialog

```
┌─────────────────────────────────────────┐
│ Cập nhật ngày phép - Nguyen Van A       │
├─────────────────────────────────────────┤
│ Năm: 2026                               │
│                                         │
│ Phép năm (ANNUAL)                       │
│ ┌─────────────────────────────────────┐ │
│ │ Tổng ngày cấp: [12    ]             │ │
│ │ Đã sử dụng:    3 ngày               │ │
│ │ Còn lại:       9 ngày               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Phép ốm (SICK)                          │
│ ┌─────────────────────────────────────┐ │
│ │ Tổng ngày cấp: [5     ]             │ │
│ │ Đã sử dụng:    1 ngày               │ │
│ │ Còn lại:       4 ngày               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│              [Hủy]  [Lưu]               │
└─────────────────────────────────────────┘
```

### Bulk Allocate Dialog

```
┌─────────────────────────────────────────┐
│ Cấp phát ngày phép hàng loạt            │
├─────────────────────────────────────────┤
│ Năm:        [2026 ▼]                    │
│ Loại phép:  [Phép năm ▼]                │
│ Số ngày:    [12    ]                    │
│                                         │
│ Áp dụng cho:                            │
│ ○ Tất cả nhân viên (50 người)           │
│ ○ Chọn nhân viên cụ thể                 │
│   ☑ Nguyen Van A                        │
│   ☑ Tran Thi B                          │
│   ☐ Le Van C                            │
│                                         │
│ ⚠️ Sẽ cập nhật cho 50 nhân viên         │
│                                         │
│              [Hủy]  [Cấp phát]          │
└─────────────────────────────────────────┘
```

## Sidebar Navigation

Thêm menu item vào sidebar config:

```typescript
{
  key: "leave-balances",
  label: t("navigation.leaveBalances"),
  href: "/dashboard/leave-balances",
  icon: CalendarDays,
}
```

Đặt trong group "Quản lý" cùng với leaves, attendance.

## Security

- Chỉ ADMIN_COMPANY và MANAGER_COMPANY có quyền truy cập
- Sử dụng `@PreAuthorize(RoleConstants.HAS_COMPANY_ACCESS)`

## Correctness Properties

### Property 1: Balance Consistency

- `remainingDays` MUST equal `totalDays - usedDays`
- `remainingDays` MUST be >= 0

### Property 2: Bulk Allocation Idempotency

- Bulk allocation với cùng parameters MUST produce same result
- Existing `usedDays` MUST be preserved after bulk allocation

### Property 3: Year Isolation

- Balance for year X MUST NOT affect balance for year Y
- Each year has independent balance records
