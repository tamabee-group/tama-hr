# Implementation Plan: Department Management

## Overview

Triển khai hệ thống quản lý phòng ban cho công ty, bao gồm backend API, frontend UI, và tích hợp với hệ thống nhân viên hiện có.

Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt

## Tasks

- [x] 1. Backend - Database Schema
  - [x] 1.1 Tạo bảng departments trong Flyway migration
    - Thêm vào V1\_\_init.sql: bảng departments với id, name, code, description, parent_id, manager_id, deleted
    - Thêm indexes cho parent_id, manager_id, deleted
    - _Requirements: 2.1, 3.1, 4.4_
  - [x] 1.2 Cập nhật bảng user_profiles thêm department_id
    - Thêm cột department_id với FK đến departments
    - Thêm index cho department_id
    - _Requirements: 5.2_

- [x] 2. Backend - Entity và Repository
  - [x] 2.1 Tạo DepartmentEntity
    - Entity với các fields: id, name, code, description
    - Self-reference ManyToOne cho parent
    - OneToMany cho children
    - ManyToOne cho manager (UserEntity)
    - Soft delete với deleted field
    - _Requirements: 2.1, 2.2, 2.3, 4.4_
  - [x] 2.2 Tạo DepartmentRepository
    - findByDeletedFalse với Pageable
    - findByIdAndDeletedFalse
    - existsByCodeAndDeletedFalse
    - findByParentIdAndDeletedFalse
    - countByDepartmentIdAndDeletedFalse (cho employee count)
    - _Requirements: 1.1, 2.4_
  - [x] 2.3 Cập nhật UserProfileEntity thêm department relationship
    - Thêm ManyToOne relationship đến DepartmentEntity
    - _Requirements: 5.2_

- [x] 3. Backend - DTOs
  - [x] 3.1 Tạo Request DTOs
    - CreateDepartmentRequest: name, code, description, parentId, managerId
    - UpdateDepartmentRequest: name, code, description, parentId, managerId
    - _Requirements: 2.1, 3.1_
  - [x] 3.2 Tạo Response DTOs
    - DepartmentResponse: id, name, code, description, parent, manager, employeeCount
    - DepartmentTreeNode: id, name, code, manager, employeeCount, children
    - DepartmentSummary: id, name (cho dropdown)
    - _Requirements: 1.1, 1.2_

- [x] 4. Backend - Service Layer
  - [x] 4.1 Tạo IDepartmentService interface
    - getDepartments(Pageable): Page<DepartmentResponse>
    - getDepartmentTree(): List<DepartmentTreeNode>
    - getDepartment(id): DepartmentResponse
    - createDepartment(request): DepartmentResponse
    - updateDepartment(id, request): DepartmentResponse
    - deleteDepartment(id): void
    - getDepartmentEmployees(id): List<UserResponse>
    - getDepartmentsForDropdown(): List<DepartmentSummary>
    - getDefaultApprover(employeeId): ApproverResponse
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.3, 8.1_
  - [x] 4.2 Implement DepartmentServiceImpl
    - Implement tất cả methods từ interface
    - Validate duplicate code
    - Validate circular reference khi update parent
    - Check employees/children trước khi delete
    - _Requirements: 2.4, 2.5, 3.2, 4.2, 4.3_

- [x] 5. Backend - Controller
  - [x] 5.1 Tạo CompanyDepartmentController
    - GET /api/company/departments - danh sách phân trang
    - GET /api/company/departments/tree - cây phòng ban
    - GET /api/company/departments/dropdown - cho dropdown select
    - GET /api/company/departments/{id} - chi tiết
    - POST /api/company/departments - tạo mới
    - PUT /api/company/departments/{id} - cập nhật
    - DELETE /api/company/departments/{id} - xóa
    - GET /api/company/departments/{id}/employees - nhân viên trong phòng ban
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.3_

- [x] 6. Backend - Cập nhật Employee APIs
  - [x] 6.1 Cập nhật UpdateUserProfileRequest thêm departmentId
    - Thêm field departmentId
    - _Requirements: 5.2_
  - [x] 6.2 Cập nhật CompanyEmployeeServiceImpl
    - Xử lý departmentId khi update employee
    - _Requirements: 5.2_
  - [x] 6.3 Cập nhật EmployeePersonalInfoResponse
    - Thêm department info vào WorkInfoSection
    - _Requirements: 6.1_
  - [x] 6.4 Thêm endpoint getDefaultApprover
    - GET /api/company/employees/{id}/default-approver
    - Trả về department manager hoặc null
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 7. Backend - Checkpoint
  - Backend compile thành công

- [x] 8. Frontend - Types và API
  - [x] 8.1 Tạo types cho Department
    - Department, DepartmentTreeNode, DepartmentSummary interfaces
    - _Requirements: 1.1_
  - [x] 8.2 Tạo API functions
    - getDepartments, getDepartmentTree, getDepartmentsForDropdown
    - createDepartment, updateDepartment, deleteDepartment
    - getDepartmentEmployees, getDefaultApprover
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 9. Frontend - Department Management Page
  - [x] 9.1 Tạo page /dashboard/departments
    - Server component với getTranslations
    - _Requirements: 1.1_
  - [x] 9.2 Tạo \_department-tree.tsx
    - Hiển thị cây phòng ban với expand/collapse
    - Hiển thị name, code, manager, employee count
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 9.3 Tạo \_department-dialog.tsx
    - Form tạo/sửa phòng ban
    - Fields: name, code, description, parent (dropdown), manager (dropdown)
    - _Requirements: 2.1, 2.2, 2.3, 3.1_
  - [x] 9.4 Tạo \_department-actions.tsx
    - Edit và Delete buttons
    - Confirm dialog cho delete
    - _Requirements: 3.1, 4.1_
  - [x] 9.5 Thêm search functionality
    - Search input để filter theo name hoặc code
    - _Requirements: 1.4_

- [x] 10. Frontend - Cập nhật Employee Work Info
  - [x] 10.1 Cập nhật \_edit-work-info-dialog.tsx
    - Thay text input department bằng dropdown
    - Fetch departments từ API
    - _Requirements: 6.2_
  - [x] 10.2 Cập nhật \_work-info-card.tsx
    - Hiển thị department name từ API response
    - _Requirements: 6.1_
  - [x] 10.3 Cập nhật UpdateCompanyEmployeeRequest
    - Thêm departmentId field
    - _Requirements: 5.2_

- [x] 11. Frontend - Auto-select Approver
  - [x] 11.1 Cập nhật leave request form
    - Fetch default approver khi mở form
    - Auto-select nếu có, cho phép thay đổi
    - _Requirements: 8.1, 8.4_
  - [x] 11.2 Cập nhật attendance adjustment form
    - Fetch default approver khi mở form
    - Auto-select nếu có, cho phép thay đổi
    - _Requirements: 8.2, 8.4_

- [x] 12. Frontend - Translations
  - [x] 12.1 Thêm translations cho department management
    - vi.json, en.json, ja.json
    - Keys: departments.title, departments.create, departments.edit, etc.
    - _Requirements: 1.1_

- [x] 13. Frontend - Navigation
  - [x] 13.1 Thêm menu item Departments vào sidebar
    - Chỉ hiển thị cho ADMIN_COMPANY và MANAGER_COMPANY
    - _Requirements: 1.1_

- [x] 14. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
