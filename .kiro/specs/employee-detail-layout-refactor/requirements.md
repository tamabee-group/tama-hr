# Requirements Document

## Introduction

Refactor layout trang Employee Detail để cải thiện UX/UI theo design mới. Layout mới sẽ có header cố định với thông tin nhân viên, navigation tabs cho các section khác nhau (Overview, Personal Info, Attendance, Salary, Documents), và sidebar hiển thị thông tin bổ sung. Backend cần hỗ trợ API tổng hợp để giảm số lượng request và đảm bảo multi-tenant security.

## Glossary

- **Employee_Detail_Page**: Trang hiển thị thông tin chi tiết của một nhân viên
- **Overview_Tab**: Tab tổng quan hiển thị thống kê chấm công, lịch làm việc, thông tin lương
- **Personal_Info_Tab**: Tab thông tin cá nhân với các section: General, Contact, Bank, Family, Emergency
- **Attendance_Tab**: Tab lịch sử chấm công với bảng dữ liệu và thống kê
- **Salary_Tab**: Tab thông tin lương với payroll summary và payslip history
- **Documents_Tab**: Tab quản lý tài liệu của nhân viên
- **Employee_Header**: Header cố định hiển thị avatar, tên, mã nhân viên, status và actions
- **Leave_Balance_Card**: Card hiển thị số ngày phép còn lại theo loại
- **Performance_Index_Card**: Card hiển thị chỉ số đánh giá hiệu suất
- **Salary_Overview_Card**: Card hiển thị tổng quan lương tháng hiện tại
- **Team_Hierarchy_Card**: Card hiển thị cấu trúc team (manager, direct reports)
- **Multi_Tenant_System**: Hệ thống phân tách dữ liệu theo công ty (tenant)

## Requirements

### Requirement 1: Employee Header

**User Story:** As a HR manager, I want to see employee basic info in a fixed header, so that I can quickly identify the employee while navigating different tabs.

#### Acceptance Criteria

1. THE Employee_Header SHALL display employee avatar, full name, job title, employee code, and status badge
2. THE Employee_Header SHALL remain fixed at the top when scrolling within tabs
3. WHEN the user clicks "Edit Profile" button, THE Employee_Detail_Page SHALL navigate to edit mode
4. WHEN the user clicks "Actions" dropdown, THE Employee_Detail_Page SHALL show available actions (Send Email, Voice Call, etc.)
5. THE Employee_Header SHALL display back arrow to return to employee list

### Requirement 2: Tab Navigation

**User Story:** As a HR manager, I want to navigate between different sections using tabs, so that I can access specific employee information quickly.

#### Acceptance Criteria

1. THE Employee_Detail_Page SHALL display tabs: Overview, Personal Info, Attendance, Salary, Documents
2. WHEN the user clicks a tab, THE Employee_Detail_Page SHALL switch to the corresponding content without page reload
3. THE Employee_Detail_Page SHALL preserve the active tab state in URL for bookmarking
4. THE Employee_Detail_Page SHALL highlight the currently active tab

### Requirement 3: Overview Tab Layout

**User Story:** As a HR manager, I want to see a comprehensive overview of employee status, so that I can quickly assess their current situation.

#### Acceptance Criteria

1. THE Overview_Tab SHALL display statistics cards: Present Days, Total Hours, Overtime, Late/Early count
2. THE Overview_Tab SHALL display Attendance Activity table showing recent 5 records with Date, Check In, Check Out, Status, Hours
3. THE Overview_Tab SHALL display Current Schedule card with shift name, days, and time range
4. THE Overview_Tab SHALL display Team Hierarchy card showing manager and direct reports
5. THE Overview_Tab SHALL display sidebar with Leave Balance, Performance Index, and Salary Overview cards
6. WHEN the user clicks "View All Attendance Logs", THE Employee_Detail_Page SHALL navigate to Attendance tab

### Requirement 4: Personal Info Tab Layout

**User Story:** As a HR manager, I want to view and edit employee personal information organized in sections, so that I can manage employee data efficiently.

#### Acceptance Criteria

1. THE Personal_Info_Tab SHALL display left sidebar with section navigation: General, Contact Information, Bank Details, Family & Dependents, Emergency Contacts
2. WHEN the user clicks a section in sidebar, THE Personal_Info_Tab SHALL scroll to that section
3. THE Personal_Info_Tab SHALL display Basic Information card with avatar, name, date of birth, gender, nationality, marital status, national ID
4. THE Personal_Info_Tab SHALL display Work Information card with job title, department, direct manager, employment type, joining date, work location
5. THE Personal_Info_Tab SHALL display Contact Information card with phone, email, address
6. THE Personal_Info_Tab SHALL display Bank Details card with bank name, account number, account name
7. WHEN the user clicks "Edit" on any card, THE Personal_Info_Tab SHALL enable edit mode for that section

### Requirement 5: Attendance Tab Layout

**User Story:** As a HR manager, I want to view detailed attendance history with filtering options, so that I can analyze employee attendance patterns.

#### Acceptance Criteria

1. THE Attendance_Tab SHALL display statistics cards: Total Work Days, On Time count, Late Count, Overtime Hours
2. THE Attendance_Tab SHALL display filter controls: Month selector, Status filter, Search by date
3. THE Attendance_Tab SHALL display attendance table with columns: Date (with day name), Shift, Check In, Check Out, Status, Total Hours, Actions
4. THE Attendance_Tab SHALL support pagination for attendance records
5. WHEN the user clicks "Export CSV", THE Attendance_Tab SHALL download attendance data as CSV file
6. THE Attendance_Tab SHALL display status badges with appropriate colors (On Time: green, Late: orange, Overtime: blue, Weekly Off: gray, Sick Leave: red)

### Requirement 6: Salary Tab Layout

**User Story:** As a HR manager, I want to view employee salary configuration and history, so that I can manage compensation effectively.

#### Acceptance Criteria

1. THE Salary_Tab SHALL reuse existing SalaryConfigContent component from dashboard/employees/[id]/salary
2. THE Salary_Tab SHALL display hint box explaining salary config rules (collapsible)
3. THE Salary_Tab SHALL display salary config history table on the left side
4. THE Salary_Tab SHALL display current salary config card on the right side (fixed width 360px)
5. THE Salary_Tab SHALL support create new salary config via dialog
6. THE Salary_Tab SHALL support edit existing salary config via dialog
7. THE Salary_Tab SHALL support delete salary config with confirmation
8. WHEN salary config is created/updated/deleted, THE Salary_Tab SHALL refresh data automatically
9. AFTER refactor is complete, THE old salary page (dashboard/employees/[id]/salary) SHALL be removed

### Requirement 7: Documents Tab Layout

**User Story:** As a HR manager, I want to manage employee documents, so that I can store and access important files.

#### Acceptance Criteria

1. THE Documents_Tab SHALL display document grid/list with file cards showing: file icon, file name, added date, file size
2. THE Documents_Tab SHALL support filter by document type and sort by date
3. THE Documents_Tab SHALL support grid view and list view toggle
4. WHEN the user clicks "Upload New Document", THE Documents_Tab SHALL open file upload dialog
5. WHEN the user clicks "View" on a document, THE Documents_Tab SHALL preview the document
6. WHEN the user clicks "Download" on a document, THE Documents_Tab SHALL download the file
7. WHEN the user clicks delete icon on a document, THE Documents_Tab SHALL confirm and delete the document

### Requirement 8: Backend API - Employee Overview Endpoint (Composite API)

**User Story:** As a frontend developer, I want a single API endpoint that returns all overview data, so that I can reduce the number of API calls and server load.

#### Acceptance Criteria

1. THE Backend_API SHALL provide GET /api/company/employees/{id}/overview endpoint
2. THE Backend_API SHALL return composite response including: employee basic info, attendance summary, current schedule, salary config, recent 5 payslips, leave balance, team hierarchy in single response
3. THE Backend_API SHALL validate that the employee belongs to the current tenant
4. IF the employee does not belong to current tenant, THEN THE Backend_API SHALL return 404 Not Found
5. THE Backend_API SHALL use @Transactional(readOnly = true) for read operations
6. THE Backend_API SHALL use parallel data fetching (CompletableFuture) to reduce response time

### Requirement 12: API Optimization Strategy

**User Story:** As a system architect, I want to minimize API calls and server load, so that the system remains performant under high usage.

#### Acceptance Criteria

1. THE Frontend SHALL use lazy loading for tab content - only fetch data when tab is first activated
2. THE Frontend SHALL cache tab data in component state to avoid re-fetching when switching tabs
3. THE Frontend SHALL use the composite overview endpoint for Overview tab instead of multiple separate calls
4. THE Backend_API SHALL provide GET /api/company/employees/{id}/personal-info endpoint returning all personal info sections in one call
5. THE Backend_API SHALL provide GET /api/company/employees/{id}/attendance-summary endpoint with optional period parameter
6. THE Backend_API SHALL provide GET /api/company/employees/{id}/salary-overview endpoint returning payroll summary and recent payslips
7. WHEN the user switches tabs, THE Frontend SHALL NOT re-fetch data if already cached
8. THE Frontend SHALL implement stale-while-revalidate pattern for background data refresh

### Requirement 9: Reuse Existing Leave Balance Logic

**User Story:** As a backend developer, I want to reuse existing leave balance logic, so that I maintain consistency with company settings.

#### Acceptance Criteria

1. THE Backend_API SHALL reuse ILeaveService.getLeaveBalance() for leave balance data
2. THE Backend_API SHALL include leave balance in the overview composite response
3. THE Leave_Balance SHALL respect company's leave type configurations
4. THE Leave_Balance SHALL calculate remainingDays = totalDays - usedDays

### Requirement 10: Backend API - Employee Documents Endpoint

**User Story:** As a frontend developer, I want CRUD operations for employee documents, so that I can manage document uploads.

#### Acceptance Criteria

1. THE Backend_API SHALL provide GET /api/company/employees/{id}/documents endpoint with pagination
2. THE Backend_API SHALL provide POST /api/company/employees/{id}/documents endpoint for upload
3. THE Backend_API SHALL provide DELETE /api/company/employees/{id}/documents/{docId} endpoint
4. THE Backend_API SHALL validate file types (PDF, DOC, DOCX, JPG, PNG, XLS, XLSX)
5. THE Backend_API SHALL limit file size to 10MB per document
6. WHEN a document is deleted, THE Backend_API SHALL also delete the physical file from storage

### Requirement 11: Multi-Tenant Security

**User Story:** As a system administrator, I want all employee data to be isolated by tenant, so that companies cannot access each other's data.

#### Acceptance Criteria

1. THE Backend_API SHALL extract tenant from TenantContext for all employee-related queries
2. THE Backend_API SHALL validate that requested employee belongs to current tenant before any operation
3. IF tenant validation fails, THEN THE Backend_API SHALL return appropriate error without exposing data
4. THE Backend_API SHALL use repository methods with tenant filtering (e.g., findByIdAndCompanyIdAndDeletedFalse)

### Requirement 13: Data Caching Strategy

**User Story:** As a backend developer, I want to implement caching for frequently accessed data, so that database load is reduced.

#### Acceptance Criteria

1. THE Backend_API SHALL cache company settings using existing CachedCompanySettingsService
2. THE Backend_API SHALL cache leave type configurations per company
3. THE Backend_API SHALL use cache TTL of 5 minutes for employee overview data
4. WHEN employee data is updated, THE Backend_API SHALL invalidate related cache entries
5. THE Backend_API SHALL use Spring Cache abstraction with @Cacheable annotations

### Requirement 14: Pagination and Partial Loading

**User Story:** As a frontend developer, I want to load data incrementally, so that initial page load is fast.

#### Acceptance Criteria

1. THE Attendance_Tab SHALL load only first page (20 records) initially
2. THE Documents_Tab SHALL load only first page (20 documents) initially
3. THE Payslip_History SHALL load only first page (20 records) initially
4. WHEN the user scrolls or clicks pagination, THE Frontend SHALL fetch next page
5. THE Backend_API SHALL support cursor-based pagination for large datasets
