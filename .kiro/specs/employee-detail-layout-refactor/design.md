# Design Document: Employee Detail Layout Refactor

## Overview

Refactor trang Employee Detail với layout mới theo design, bao gồm:

- Fixed header với thông tin nhân viên và actions
- Tab navigation (Overview, Personal Info, Attendance, Salary, Documents)
- Composite API endpoints để giảm số lượng request
- Lazy loading và caching strategy cho performance
- Multi-tenant security validation

## Architecture

### Frontend Architecture

```
src/app/[locale]/(DashboardLayout)/dashboard/employees/[id]/
├── page.tsx                          # Main page với header và tabs
├── _employee-header.tsx              # Fixed header component
├── _tab-navigation.tsx               # Tab navigation component
├── _overview-tab/
│   ├── _overview-content.tsx         # Overview tab content
│   ├── _attendance-stats.tsx         # Statistics cards
│   ├── _attendance-activity.tsx      # Recent attendance table
│   ├── _current-schedule.tsx         # Schedule card
│   ├── _team-hierarchy.tsx           # Team hierarchy card
│   └── _sidebar/
│       ├── _leave-balance.tsx        # Leave balance card
│       ├── _performance-index.tsx    # Performance card (placeholder)
│       └── _salary-overview.tsx      # Salary overview card
├── _personal-info-tab/
│   ├── _personal-info-content.tsx    # Personal info tab content
│   ├── _section-sidebar.tsx          # Section navigation
│   ├── _basic-info-card.tsx          # Basic information
│   ├── _work-info-card.tsx           # Work information
│   ├── _contact-info-card.tsx        # Contact information
│   └── _bank-details-card.tsx        # Bank details
├── _attendance-tab/
│   ├── _attendance-content.tsx       # Attendance tab content
│   ├── _attendance-stats.tsx         # Statistics cards
│   ├── _attendance-filters.tsx       # Filter controls
│   └── _attendance-table.tsx         # Attendance records table
├── _salary-tab/
│   └── _salary-content.tsx           # Reuse SalaryConfigContent
└── _documents-tab/
    ├── _documents-content.tsx        # Documents tab content
    ├── _document-filters.tsx         # Filter and view toggle
    ├── _document-grid.tsx            # Grid view
    ├── _document-list.tsx            # List view
    └── _upload-dialog.tsx            # Upload dialog
```

### Backend Architecture

```
controller/company/
├── CompanyEmployeeController.java    # Existing + new endpoints

service/company/
├── interfaces/
│   ├── ICompanyEmployeeService.java  # Add new methods
│   └── IEmployeeDocumentService.java # New service
└── impl/
    ├── CompanyEmployeeServiceImpl.java
    └── EmployeeDocumentServiceImpl.java

dto/response/
├── employee/
│   ├── EmployeeOverviewResponse.java # Composite response
│   ├── EmployeePersonalInfoResponse.java
│   └── EmployeeDocumentResponse.java

entity/
└── user/
    └── EmployeeDocumentEntity.java   # New entity

# Reused existing services:
# - ILeaveService.getLeaveBalance()
# - IAttendanceService.getAttendanceSummary()
# - IWorkScheduleService.getEffectiveSchedule()
# - IPayrollService.getEmployeePayrollHistory()
# - IEmployeeSalaryConfigService.getCurrentConfig()
```

## Components and Interfaces

### Frontend Components

#### EmployeeHeader Component

```typescript
interface EmployeeHeaderProps {
  employee: User;
  onEditProfile: () => void;
}

// Displays: avatar, name, job title, employee code, status badge
// Actions: Edit Profile button, Actions dropdown (Send Email, Voice Call)
// Back arrow to employee list
```

#### TabNavigation Component

```typescript
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Tabs: overview, personal-info, attendance, salary, documents
// URL sync: ?tab=overview
```

#### OverviewContent Component

```typescript
interface OverviewContentProps {
  employeeId: number;
  initialData?: EmployeeOverview; // SSR data
}

// Fetches from /api/company/employees/{id}/overview
// Displays: stats, attendance activity, schedule, team, sidebar
```

### Backend Interfaces

#### ICompanyEmployeeService (Extended)

```java
public interface ICompanyEmployeeService {
    // Existing methods...

    /**
     * Lấy overview data cho employee detail page
     * Reuse các service hiện có: ILeaveService, IAttendanceService, IWorkScheduleService, IPayrollService
     * Bao gồm: attendance summary, schedule, salary config, payslips, leave balance
     */
    EmployeeOverviewResponse getEmployeeOverview(Long employeeId);

    /**
     * Lấy personal info đầy đủ của nhân viên
     */
    EmployeePersonalInfoResponse getEmployeePersonalInfo(Long employeeId);
}
```

#### IEmployeeDocumentService (New)

```java
public interface IEmployeeDocumentService {
    Page<EmployeeDocumentResponse> getEmployeeDocuments(Long employeeId, Pageable pageable);
    EmployeeDocumentResponse uploadDocument(Long employeeId, MultipartFile file, String documentType);
    void deleteDocument(Long employeeId, Long documentId);
}
```

#### Reused Existing Services

- **ILeaveService.getLeaveBalance(employeeId, year)** - Lấy leave balance theo năm
- **IAttendanceService.getAttendanceSummary(employeeId, period)** - Lấy attendance summary theo period
- **IWorkScheduleService.getEffectiveSchedule(employeeId, date)** - Lấy schedule hiệu lực
- **IPayrollService.getEmployeePayrollHistory(employeeId, pageable)** - Lấy payslip history
- **IEmployeeSalaryConfigService.getCurrentConfig(employeeId)** - Lấy salary config hiện tại

````

## Data Models

### EmployeeOverviewResponse (Composite)

```java
@Data
public class EmployeeOverviewResponse {
    private UserResponse employee;
    private AttendanceSummaryResponse attendanceSummary;
    private List<AttendanceRecordResponse> recentAttendance;
    private WorkScheduleResponse currentSchedule;
    private EmployeeSalaryConfigResponse salaryConfig;
    private List<PayrollRecordResponse> recentPayslips;
    private List<LeaveBalanceResponse> leaveBalance;
    private TeamHierarchyResponse teamHierarchy;
}
````

### LeaveBalanceResponse

```java
@Data
public class LeaveBalanceResponse {
    private LeaveType leaveType;
    private String leaveTypeName; // Translated name
    private Integer totalDays;
    private Integer usedDays;
    private Integer remainingDays;
    private Integer year;
}
```

### EmployeeDocumentEntity (New)

```java
@Entity
@Table(name = "employee_documents")
public class EmployeeDocumentEntity extends BaseEntity {
    private Long employeeId;
    private Long companyId; // For tenant isolation
    private String fileName;
    private String fileUrl;
    private String fileType; // PDF, DOC, JPG, etc.
    private Long fileSize; // In bytes
    private String documentType; // CONTRACT, ID_CARD, CERTIFICATE, etc.
}
```

### EmployeeDocumentResponse

```java
@Data
public class EmployeeDocumentResponse {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String documentType;
    private LocalDateTime createdAt;
}
```

### TeamHierarchyResponse

```java
@Data
public class TeamHierarchyResponse {
    private UserSummaryResponse manager; // Direct manager
    private List<UserSummaryResponse> directReports; // Subordinates
}

@Data
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String jobTitle;
    private String avatar;
}
```

## API Endpoints

### GET /api/company/employees/{id}/overview

Returns composite data for Overview tab (reuse existing services).

### GET /api/company/employees/{id}/personal-info

Returns all personal info sections.

### GET /api/company/employees/{id}/documents

Returns paginated documents.

### POST /api/company/employees/{id}/documents

Upload new document.

### DELETE /api/company/employees/{id}/documents/{docId}

Delete document.

### Existing Endpoints (Reused)

- **GET /api/company/employees/{id}/attendance/summary** - Attendance summary (existing)
- **GET /api/company/employees/{id}/effective-schedule** - Current schedule (existing)
- **GET /api/company/employees/{id}/payroll** - Payroll history (existing)
- **GET /api/core/me/leave-balance** - Leave balance (existing in EmployeeLeaveController)

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Tenant Isolation

_For any_ employee ID and tenant context, if the employee does not belong to the current tenant, the API SHALL return 404 Not Found without exposing any employee data.
**Validates: Requirements 8.3, 8.4, 9.4, 11.2, 11.3**

### Property 2: Overview Response Completeness

_For any_ valid employee in the current tenant, the overview endpoint SHALL return a response containing all required fields: employee info, attendance summary, recent attendance (≤5), current schedule, salary config, recent payslips (≤4), leave balance, and team hierarchy.
**Validates: Requirements 8.2**

### Property 3: Leave Balance Calculation

_For any_ employee and year, the leave balance response SHALL satisfy: remainingDays = totalDays - usedDays for each leave type.
**Validates: Requirements 9.2, 9.3**

### Property 4: Document File Type Validation

_For any_ file upload request, if the file type is not in the allowed list (PDF, DOC, DOCX, JPG, PNG, XLS, XLSX), the API SHALL reject the upload with appropriate error.
**Validates: Requirements 10.4**

### Property 5: Document File Size Validation

_For any_ file upload request, if the file size exceeds 10MB, the API SHALL reject the upload with appropriate error.
**Validates: Requirements 10.5**

### Property 6: Document Deletion Cleanup

_For any_ document deletion, the API SHALL delete both the database record AND the physical file from storage.
**Validates: Requirements 10.6**

### Property 7: Attendance Status Color Mapping

_For any_ attendance status, the UI SHALL display the correct color: ON_TIME → green, LATE → orange, OVERTIME → blue, WEEKLY_OFF → gray, SICK_LEAVE → red.
**Validates: Requirements 5.6**

### Property 8: Pagination Bounds

_For any_ paginated endpoint, the returned page size SHALL not exceed the requested size, and page number SHALL be within valid bounds.
**Validates: Requirements 14.5**

## Error Handling

### HTTP Status Codes

- 200: Success
- 201: Created (document upload)
- 400: Bad Request (invalid file type, file too large)
- 404: Not Found (employee not in tenant, document not found)
- 403: Forbidden (no permission)
- 500: Internal Server Error

### Error Codes

```java
public enum ErrorCode {
    EMPLOYEE_NOT_FOUND,
    DOCUMENT_NOT_FOUND,
    INVALID_FILE_TYPE,
    FILE_TOO_LARGE,
    UPLOAD_FAILED,
    DELETE_FAILED
}
```

## Testing Strategy

### Unit Tests

- Test tenant validation logic
- Test leave balance calculation
- Test file type validation
- Test file size validation
- Test response mapping

### Property-Based Tests

- Property 1: Generate random employee IDs and tenant contexts, verify tenant isolation
- Property 3: Generate random leave balance data, verify calculation invariant
- Property 4: Generate random file types, verify validation
- Property 5: Generate random file sizes, verify size limit
- Property 7: Generate all attendance statuses, verify color mapping

### Integration Tests

- Test composite endpoint returns all data
- Test document upload/delete flow
- Test pagination behavior

### Testing Framework

- Backend: JUnit 5 + jqwik (property-based testing)
- Frontend: Vitest + React Testing Library
