# Requirements Document

## Introduction

Tạo tính năng quản lý số ngày nghỉ phép (Leave Balance) cho Admin/Manager công ty. Hiện tại hệ thống chỉ cho phép xem số ngày phép của nhân viên, chưa có chức năng để admin cấp phát hoặc điều chỉnh số ngày phép. Tính năng này sẽ cho phép:

- Xem tổng quan số ngày phép của tất cả nhân viên
- Cấp phát số ngày phép theo năm cho từng nhân viên hoặc hàng loạt
- Điều chỉnh số ngày phép khi cần thiết

## Glossary

- **Leave_Balance**: Số ngày phép của nhân viên theo loại (ANNUAL, SICK) và theo năm
- **Leave_Balance_Entity**: Entity lưu trữ thông tin số ngày phép trong database
- **Leave_Balance_API**: API endpoints để quản lý số ngày phép
- **Leave_Balance_Service**: Service xử lý logic cập nhật số ngày phép
- **Leave_Balance_Page**: Trang quản lý số ngày phép trong dashboard
- **Leave_Balance_Dialog**: Dialog để cập nhật số ngày phép cho nhân viên

## Requirements

### Requirement 1: Tạo API endpoint cập nhật số ngày phép cho nhân viên

**User Story:** As a company admin, I want to update an employee's leave balance through API, so that I can allocate or adjust their leave days.

#### Acceptance Criteria

1. THE Leave_Balance_API SHALL provide `PUT /api/company/employees/{id}/leave-balance` endpoint to update leave balance
2. THE Leave_Balance_API SHALL accept request body with `leaveType`, `year`, `totalDays` fields
3. THE Leave_Balance_API SHALL create new balance record if not exists for the employee/year/type combination
4. THE Leave_Balance_API SHALL update existing balance record if already exists
5. THE Leave_Balance_API SHALL recalculate `remainingDays` based on `totalDays - usedDays`
6. THE Leave_Balance_API SHALL return the updated balance information in response

### Requirement 2: Tạo API endpoint cấp phát số ngày phép hàng loạt

**User Story:** As a company admin, I want to allocate leave days to multiple employees at once, so that I can efficiently manage leave balances at the start of each year.

#### Acceptance Criteria

1. THE Leave_Balance_API SHALL provide `POST /api/company/leave-balances/bulk` endpoint for bulk allocation
2. THE Leave_Balance_API SHALL accept request body with `year`, `leaveType`, `totalDays`, `employeeIds` (optional - all if empty)
3. THE Leave_Balance_API SHALL create or update balance records for all specified employees
4. THE Leave_Balance_API SHALL return summary of updated records count

### Requirement 3: Tạo API endpoint lấy danh sách số ngày phép của tất cả nhân viên

**User Story:** As a company admin, I want to view all employees' leave balances in one place, so that I can monitor and manage leave allocations.

#### Acceptance Criteria

1. THE Leave_Balance_API SHALL provide `GET /api/company/leave-balances` endpoint with pagination
2. THE Leave_Balance_API SHALL support filter by `year` parameter (default current year)
3. THE Leave_Balance_API SHALL support filter by `leaveType` parameter (optional)
4. THE Leave_Balance_API SHALL support search by employee name or code
5. THE Leave_Balance_API SHALL return employee info along with their balance for each leave type

### Requirement 4: Tạo trang quản lý số ngày phép trong Dashboard

**User Story:** As a company admin, I want a dedicated page to manage all employees' leave balances, so that I can easily view and update leave allocations.

#### Acceptance Criteria

1. THE Leave_Balance_Page SHALL be accessible at `/dashboard/leave-balances` route
2. THE Leave_Balance_Page SHALL display a table with columns: STT, Employee Name, Employee Code, ANNUAL (Total/Used/Remaining), SICK (Total/Used/Remaining)
3. THE Leave_Balance_Page SHALL have year filter dropdown (default current year)
4. THE Leave_Balance_Page SHALL have search input to filter by employee name or code
5. THE Leave_Balance_Page SHALL have "Cấp phát hàng loạt" button to open bulk allocation dialog

### Requirement 5: Tạo dialog cập nhật số ngày phép cho từng nhân viên

**User Story:** As a company admin, I want to click on an employee row to update their leave balance, so that I can make individual adjustments.

#### Acceptance Criteria

1. THE Leave_Balance_Dialog SHALL open when clicking edit button on employee row
2. THE Leave_Balance_Dialog SHALL display employee name and current balance
3. THE Leave_Balance_Dialog SHALL have input fields for ANNUAL and SICK total days
4. THE Leave_Balance_Dialog SHALL show calculated remaining days (total - used)
5. THE Leave_Balance_Dialog SHALL save changes and refresh the table on submit

### Requirement 6: Tạo dialog cấp phát số ngày phép hàng loạt

**User Story:** As a company admin, I want to allocate leave days to all or selected employees at once, so that I can quickly set up leave balances for a new year.

#### Acceptance Criteria

1. THE Bulk_Allocation_Dialog SHALL have year selector
2. THE Bulk_Allocation_Dialog SHALL have leave type selector (ANNUAL or SICK)
3. THE Bulk_Allocation_Dialog SHALL have input for total days to allocate
4. THE Bulk_Allocation_Dialog SHALL have option to select specific employees or apply to all
5. THE Bulk_Allocation_Dialog SHALL show confirmation with number of employees affected
6. THE Bulk_Allocation_Dialog SHALL refresh the table after successful allocation

### Requirement 7: Thêm menu item vào sidebar

**User Story:** As a company admin, I want to access leave balance management from the sidebar, so that I can easily navigate to this feature.

#### Acceptance Criteria

1. THE Sidebar SHALL have "Quản lý ngày phép" menu item under the leave/attendance section
2. THE Sidebar menu item SHALL link to `/dashboard/leave-balances` route
3. THE Sidebar menu item SHALL be visible only to ADMIN_COMPANY and MANAGER_COMPANY roles

### Requirement 8: Cập nhật translations

**User Story:** As a user, I want to see the leave balance management UI in my preferred language, so that I can understand and use the feature easily.

#### Acceptance Criteria

1. THE Frontend SHALL add Vietnamese translations for all leave balance management texts
2. THE Frontend SHALL add English translations for all leave balance management texts
3. THE Frontend SHALL add Japanese translations for all leave balance management texts
