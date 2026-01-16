# Implementation Plan: Employee Detail Layout Refactor

## Overview

- Refactor Employee Detail page với layout mới, composite API endpoints, và multi-tenant security. Implementation sẽ chia thành Backend và Frontend phases.

- Kiro thực hiện task thì hãy phản hồi tôi bằng tiếng việt

## Tasks

- [x] 1. Backend - Database và Entity
  - [x] 1.1 Cập nhật Flyway migration cho employee_documents table
    - Thêm vào file V1\_\_schema.sql (vì drop db chạy lại từ đầu)
    - Columns: id, employee_id, company_id, file_name, file_url, file_type, file_size, document_type, created_at, created_by, updated_at, updated_by
    - Indexes: idx_employee_documents_employee_id, idx_employee_documents_company_id
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 1.2 Tạo EmployeeDocumentEntity
    - Tạo entity trong entity/user/EmployeeDocumentEntity.java
    - Extends BaseEntity, không có soft delete
    - _Requirements: 10.1_

- [x] 2. Backend - DTOs
  - [x] 2.1 Tạo EmployeeDocumentResponse DTO
    - Fields: id, fileName, fileUrl, fileType, fileSize, documentType, createdAt
    - _Requirements: 10.1_
  - [x] 2.2 Tạo TeamHierarchyResponse và UserSummaryResponse DTOs
    - TeamHierarchy: manager, directReports
    - UserSummary: id, name, jobTitle, avatar
    - _Requirements: 3.4_
  - [x] 2.3 Tạo EmployeeOverviewResponse DTO (Composite)
    - Reuse existing: UserResponse, AttendanceSummaryResponse, WorkScheduleResponse, EmployeeSalaryConfigResponse, PayrollRecordResponse, LeaveBalanceResponse
    - Fields: employee, attendanceSummary, recentAttendance, currentSchedule, salaryConfig, recentPayslips, leaveBalance, teamHierarchy
    - _Requirements: 8.2_
  - [x] 2.4 Tạo EmployeePersonalInfoResponse DTO
    - Fields: basicInfo, workInfo, contactInfo, bankDetails, emergencyContact
    - _Requirements: 12.4_

- [x] 3. Backend - Repository
  - [x] 3.1 Tạo EmployeeDocumentRepository
    - findByEmployeeIdAndCompanyId với pagination
    - findByIdAndEmployeeIdAndCompanyId
    - _Requirements: 10.1, 11.4_

- [x] 4. Backend - Services
  - [x] 4.1 Mở rộng ICompanyEmployeeService với getEmployeeOverview
    - Reuse ILeaveService.getLeaveBalance() cho leave balance
    - Reuse IAttendanceService cho attendance summary
    - Reuse IWorkScheduleService cho current schedule
    - Reuse IPayrollService cho recent payslips
    - Reuse EmployeeSalaryConfigService cho salary config
    - Fetch parallel với CompletableFuture
    - Validate tenant access
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [x] 4.2 Write unit test cho Tenant Isolation
    - Test employee not in tenant returns 404
    - **Validates: Requirements 8.3, 8.4, 11.2, 11.3**
  - [x] 4.3 Mở rộng ICompanyEmployeeService với getEmployeePersonalInfo
    - Return all personal info sections từ UserProfileEntity
    - _Requirements: 12.4_
  - [x] 4.4 Tạo IEmployeeDocumentService interface và EmployeeDocumentServiceImpl
    - getEmployeeDocuments, uploadDocument, deleteDocument
    - Validate file type và size
    - Delete physical file khi xóa document
    - Validate tenant access (companyId)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [x] 4.5 Write unit tests cho Document Validation
    - Test file type validation (allowed/rejected types)
    - Test file size validation (under/over 10MB)
    - **Validates: Requirements 10.4, 10.5**

- [x] 5. Backend - Controller
  - [x] 5.1 Thêm endpoint GET /employees/{id}/overview
    - Return EmployeeOverviewResponse
    - _Requirements: 8.1_
  - [x] 5.2 Thêm endpoint GET /employees/{id}/personal-info
    - Return EmployeePersonalInfoResponse
    - _Requirements: 12.4_
  - [x] 5.3 Thêm endpoints cho documents CRUD
    - GET /employees/{id}/documents (paginated)
    - POST /employees/{id}/documents (upload)
    - DELETE /employees/{id}/documents/{docId}
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 6. Checkpoint - Backend Tests
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 7. Frontend - Types và APIs
  - [x] 7.1 Tạo types cho Employee Detail
    - EmployeeOverview, LeaveBalance, EmployeeDocument, TeamHierarchy
    - _Requirements: 8.2, 9.2, 10.1, 3.4_
  - [x] 7.2 Tạo API functions
    - getEmployeeOverview, getEmployeePersonalInfo, getEmployeeLeaveBalance
    - getEmployeeDocuments, uploadEmployeeDocument, deleteEmployeeDocument
    - _Requirements: 8.1, 9.1, 10.1, 12.4_

- [x] 8. Frontend - Main Page và Header
  - [x] 8.1 Refactor page.tsx với tab navigation
    - URL sync với ?tab= parameter
    - Lazy loading cho tab content
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 12.1, 12.2_
  - [x] 8.2 Tạo \_employee-header.tsx
    - Avatar, name, job title, employee code, status badge
    - Edit Profile button, Actions dropdown
    - Back arrow
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 9. Frontend - Overview Tab
  - [x] 9.1 Tạo \_overview-tab/\_overview-content.tsx
    - Fetch từ /overview endpoint
    - Layout: main content + sidebar
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 12.3_
  - [x] 9.2 Tạo statistics cards component
    - Present Days, Total Hours, Overtime, Late/Early
    - _Requirements: 3.1_
  - [x] 9.3 Tạo attendance activity table
    - Recent 5 records
    - View All link
    - _Requirements: 3.2, 3.6_
  - [x] 9.4 Tạo current schedule card
    - Shift name, days, time range
    - _Requirements: 3.3_
  - [x] 9.5 Tạo team hierarchy card
    - Manager, direct reports
    - _Requirements: 3.4_
  - [x] 9.6 Tạo sidebar cards
    - Leave balance, Performance index (placeholder), Salary overview
    - _Requirements: 3.5_

- [x] 10. Frontend - Personal Info Tab
  - [x] 10.1 Tạo \_personal-info-tab/\_personal-info-content.tsx
    - Section sidebar + content area
    - _Requirements: 4.1, 4.2_
  - [ ] 10.2 Tạo info cards
    - Basic info, Work info, Contact info, Bank details
    - Edit button cho mỗi card
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 11. Frontend - Attendance Tab
  - [x] 11.1 Tạo \_attendance-tab/\_attendance-content.tsx
    - Statistics cards, filters, table
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 11.2 Tạo attendance table với pagination
    - Columns: Date, Shift, Check In, Check Out, Status, Total Hours, Actions
    - Status badges với colors
    - _Requirements: 5.3, 5.4, 5.6_
  - [x] 11.3 Tạo filter controls
    - Month selector, Status filter, Search, Export CSV
    - _Requirements: 5.2, 5.5_

- [x] 12. Frontend - Salary Tab
  - [x] 12.1 Tạo \_salary-tab/\_salary-content.tsx
    - Reuse SalaryConfigContent component
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 13. Frontend - Documents Tab
  - [x] 13.1 Tạo \_documents-tab/\_documents-content.tsx
    - Grid/List view toggle, filters
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 13.2 Tạo document grid và list views
    - File cards với icon, name, date, size
    - View, Download, Delete actions
    - _Requirements: 7.1, 7.5, 7.6, 7.7_
  - [x] 13.3 Tạo upload dialog
    - File type validation (client-side)
    - File size validation (client-side)
    - _Requirements: 7.4, 10.4, 10.5_

- [x] 14. Frontend - i18n
  - [x] 14.1 Thêm translations cho employee detail
    - vi.json, en.json, ja.json
    - Namespaces: employeeDetail, documents
    - _Requirements: All UI requirements_

- [x] 15. Checkpoint - Frontend Tests
  - Ensure all frontend tests pass, ask the user if questions arise.

- [x] 16. Cleanup
  - [x] 16.1 Xóa trang salary cũ
    - Remove dashboard/employees/[id]/salary folder
    - Update any references
    - _Requirements: 6.9_
  - [x] 16.2 Xóa các trang con không cần thiết
    - Review và remove: allowances, deductions, payroll folders nếu không dùng
    - _Requirements: N/A_

- [x] 17. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Unit tests được viết cho logic có tính toán (leave balance, file validation, tenant isolation)
- Layout/UI components không cần test
- Backend tasks (1-6) should be completed before Frontend tasks (7-15)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
