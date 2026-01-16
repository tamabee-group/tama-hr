# Requirements Document

## Introduction

Hệ thống quản lý phòng ban cho phép admin công ty tạo, chỉnh sửa và quản lý cấu trúc phòng ban trong tổ chức. Phòng ban có thể có cấu trúc phân cấp (parent-child) và mỗi nhân viên có thể được gán vào một phòng ban cụ thể.

## Glossary

- **Department**: Phòng ban trong công ty
- **Department_Manager**: Người quản lý phòng ban
- **Parent_Department**: Phòng ban cấp trên
- **Company_Admin**: Người có quyền ADMIN_COMPANY hoặc MANAGER_COMPANY
- **Employee**: Nhân viên thuộc phòng ban

## Requirements

### Requirement 1: Quản lý danh sách phòng ban

**User Story:** As a Company Admin, I want to view all departments in my company, so that I can manage the organizational structure.

#### Acceptance Criteria

1. WHEN a Company Admin accesses the departments page, THE System SHALL display a list of all departments with name, code, manager, and employee count
2. WHEN departments are displayed, THE System SHALL show them in a hierarchical tree structure reflecting parent-child relationships
3. WHEN a department has sub-departments, THE System SHALL allow expanding/collapsing to view child departments
4. THE System SHALL provide search functionality to filter departments by name or code

### Requirement 2: Tạo phòng ban mới

**User Story:** As a Company Admin, I want to create new departments, so that I can build the organizational structure.

#### Acceptance Criteria

1. WHEN a Company Admin submits a new department form, THE System SHALL create the department with name, code, and optional description
2. WHEN creating a department, THE System SHALL allow selecting a parent department to create hierarchy
3. WHEN creating a department, THE System SHALL allow assigning a manager from existing employees
4. IF a department code already exists in the company, THEN THE System SHALL reject the creation and show an error message
5. THE System SHALL validate that department name is not empty

### Requirement 3: Chỉnh sửa phòng ban

**User Story:** As a Company Admin, I want to edit department information, so that I can keep the organizational structure up to date.

#### Acceptance Criteria

1. WHEN a Company Admin updates a department, THE System SHALL save changes to name, code, description, parent, and manager
2. IF changing parent department would create a circular reference, THEN THE System SHALL reject the change
3. WHEN a department is updated, THE System SHALL maintain all employee assignments

### Requirement 4: Xóa phòng ban

**User Story:** As a Company Admin, I want to delete departments that are no longer needed, so that I can keep the structure clean.

#### Acceptance Criteria

1. WHEN a Company Admin deletes a department with no employees, THE System SHALL remove the department
2. IF a department has employees assigned, THEN THE System SHALL prevent deletion and show a warning
3. IF a department has sub-departments, THEN THE System SHALL prevent deletion and show a warning
4. THE System SHALL use soft delete to preserve historical data

### Requirement 5: Gán nhân viên vào phòng ban

**User Story:** As a Company Admin, I want to assign employees to departments, so that I can organize the workforce.

#### Acceptance Criteria

1. WHEN editing employee work info, THE System SHALL display a dropdown to select department from available departments
2. WHEN a department is selected, THE System SHALL update the employee's department assignment
3. THE System SHALL allow viewing all employees in a specific department

### Requirement 6: Hiển thị phòng ban trong thông tin nhân viên

**User Story:** As a user, I want to see department information in employee profiles, so that I can understand the organizational context.

#### Acceptance Criteria

1. WHEN viewing employee personal info, THE System SHALL display the department name
2. WHEN editing employee work info, THE System SHALL show department as a selectable dropdown instead of text input

### Requirement 7: Quản lý người quản lý phòng ban

**User Story:** As a Company Admin, I want to assign a manager to each department, so that there is clear leadership structure.

#### Acceptance Criteria

1. WHEN creating or editing a department, THE System SHALL allow selecting one employee as the department manager
2. THE System SHALL store the manager relationship in the department entity
3. WHEN viewing department details, THE System SHALL display the manager's name and avatar

### Requirement 8: Auto-select người duyệt yêu cầu

**User Story:** As an employee, I want my requests to be automatically assigned to my department manager, so that the approval process is streamlined.

#### Acceptance Criteria

1. WHEN an employee creates a leave request, THE System SHALL auto-select the department manager as the default approver
2. WHEN an employee creates an attendance adjustment request, THE System SHALL auto-select the department manager as the default approver
3. IF the employee has no department or department has no manager, THEN THE System SHALL show the list of all approvers (admin/manager) for manual selection
4. THE System SHALL allow the employee to change the approver if needed
