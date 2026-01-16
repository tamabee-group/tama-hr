# Design Document: Department Management

## Overview

Hệ thống quản lý phòng ban cho phép tổ chức cấu trúc công ty theo dạng cây phân cấp. Mỗi phòng ban có thể có phòng ban cha, người quản lý, và danh sách nhân viên. Hệ thống cũng hỗ trợ phân quyền theo phòng ban, cho phép manager chỉ quản lý nhân viên trong phòng ban của mình.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  /dashboard/departments     - Quản lý phòng ban             │
│  /dashboard/employees/[id]  - Cập nhật department dropdown  │
│  /dashboard/leaves          - Auto-select approver          │
│  /dashboard/adjustments     - Auto-select approver          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Spring Boot)                     │
├─────────────────────────────────────────────────────────────┤
│  CompanyDepartmentController                                 │
│    - GET    /api/company/departments                        │
│    - GET    /api/company/departments/{id}                   │
│    - POST   /api/company/departments                        │
│    - PUT    /api/company/departments/{id}                   │
│    - DELETE /api/company/departments/{id}                   │
│    - GET    /api/company/departments/{id}/employees         │
├─────────────────────────────────────────────────────────────┤
│  IDepartmentService                                          │
│    - getDepartments()                                        │
│    - getDepartmentTree()                                     │
│    - createDepartment()                                      │
│    - updateDepartment()                                      │
│    - deleteDepartment()                                      │
│    - getDefaultApprover(employeeId)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Database                              │
├─────────────────────────────────────────────────────────────┤
│  departments                                                 │
│    - id, name, code, description                            │
│    - parent_id (self-reference)                             │
│    - manager_id (FK to users)                               │
│    - deleted, created_at, updated_at                        │
├─────────────────────────────────────────────────────────────┤
│  user_profiles                                               │
│    - department_id (FK to departments)                      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Components

#### DepartmentEntity

```java
@Entity
@Table(name = "departments")
public class DepartmentEntity extends BaseEntity {
    private Long id;
    private String name;
    private String code;
    private String description;

    @ManyToOne
    private DepartmentEntity parent;

    @OneToMany(mappedBy = "parent")
    private List<DepartmentEntity> children;

    @ManyToOne
    private UserEntity manager;

    private boolean deleted = false;
}
```

#### IDepartmentService Interface

```java
public interface IDepartmentService {
    Page<DepartmentResponse> getDepartments(Pageable pageable);
    List<DepartmentTreeNode> getDepartmentTree();
    DepartmentResponse getDepartment(Long id);
    DepartmentResponse createDepartment(CreateDepartmentRequest request);
    DepartmentResponse updateDepartment(Long id, UpdateDepartmentRequest request);
    void deleteDepartment(Long id);
    List<UserResponse> getDepartmentEmployees(Long departmentId);
    ApproverResponse getDefaultApprover(Long employeeId);
}
```

#### DTOs

```java
// Request DTOs
public class CreateDepartmentRequest {
    @NotBlank String name;
    @NotBlank String code;
    String description;
    Long parentId;
    Long managerId;
}

public class UpdateDepartmentRequest {
    String name;
    String code;
    String description;
    Long parentId;
    Long managerId;
}

// Response DTOs
public class DepartmentResponse {
    Long id;
    String name;
    String code;
    String description;
    DepartmentSummary parent;
    UserSummary manager;
    int employeeCount;
}

public class DepartmentTreeNode {
    Long id;
    String name;
    String code;
    UserSummary manager;
    int employeeCount;
    List<DepartmentTreeNode> children;
}

public class DepartmentSummary {
    Long id;
    String name;
}

public class UserSummary {
    Long id;
    String name;
    String avatar;
}
```

### Frontend Components

#### Department List Page

```
/dashboard/departments/page.tsx
├── _department-tree.tsx      - Hiển thị cây phòng ban
├── _department-dialog.tsx    - Dialog tạo/sửa phòng ban
└── _department-actions.tsx   - Actions (edit, delete)
```

#### Types

```typescript
interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent?: DepartmentSummary;
  manager?: UserSummary;
  employeeCount: number;
}

interface DepartmentTreeNode {
  id: number;
  name: string;
  code: string;
  manager?: UserSummary;
  employeeCount: number;
  children: DepartmentTreeNode[];
}

interface DepartmentSummary {
  id: number;
  name: string;
}

interface UserSummary {
  id: number;
  name: string;
  avatar?: string;
}
```

## Data Models

### Database Schema

```sql
-- Bảng departments
CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES departments(id),
    manager_id BIGINT REFERENCES users(id),
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    UNIQUE(code, deleted) -- Unique code per tenant (khi deleted = false)
);

CREATE INDEX idx_departments_parent ON departments(parent_id);
CREATE INDEX idx_departments_manager ON departments(manager_id);
CREATE INDEX idx_departments_deleted ON departments(deleted);

-- Cập nhật user_profiles để thêm department_id
ALTER TABLE user_profiles ADD COLUMN department_id BIGINT REFERENCES departments(id);
CREATE INDEX idx_user_profiles_department ON user_profiles(department_id);
```

### Entity Relationships

```
DepartmentEntity
├── parent: DepartmentEntity (ManyToOne, self-reference)
├── children: List<DepartmentEntity> (OneToMany)
├── manager: UserEntity (ManyToOne)
└── employees: List<UserProfileEntity> (OneToMany, via department_id)

UserProfileEntity
└── department: DepartmentEntity (ManyToOne)
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Department creation preserves data integrity

_For any_ valid department creation request with name, code, description, parentId, and managerId, creating the department SHALL result in a department entity with exactly those values stored and retrievable.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 2: Department code uniqueness

_For any_ two departments in the same tenant, if both are not deleted, their codes SHALL be different.

**Validates: Requirements 2.4**

### Property 3: Department name validation

_For any_ department creation or update request with an empty or whitespace-only name, THE System SHALL reject the request.

**Validates: Requirements 2.5**

### Property 4: No circular references in department hierarchy

_For any_ department D, following the parent chain from D SHALL never return to D. In other words, a department cannot be its own ancestor.

**Validates: Requirements 3.2**

### Property 5: Department update preserves employee assignments

_For any_ department update operation, the set of employees assigned to that department before and after the update SHALL be identical.

**Validates: Requirements 3.3**

### Property 6: Department deletion constraints

_For any_ department with employees or sub-departments, deletion SHALL be rejected. Only departments with zero employees AND zero children can be deleted.

**Validates: Requirements 4.2, 4.3**

### Property 7: Soft delete preserves data

_For any_ deleted department, the department record SHALL still exist in the database with deleted=true, and all historical references SHALL remain valid.

**Validates: Requirements 4.4**

### Property 8: Department search returns matching results

_For any_ search query Q, all returned departments SHALL have name or code containing Q (case-insensitive).

**Validates: Requirements 1.4**

### Property 9: Default approver selection

_For any_ employee with a department that has a manager, the default approver for requests SHALL be that department manager. If no department or no manager, the system SHALL return null (indicating manual selection needed).

**Validates: Requirements 8.1, 8.2, 8.3**

## Error Handling

| Error Code               | Condition                         | HTTP Status |
| ------------------------ | --------------------------------- | ----------- |
| DEPARTMENT_NOT_FOUND     | Department ID không tồn tại       | 404         |
| DEPARTMENT_CODE_EXISTS   | Code đã tồn tại trong tenant      | 409         |
| DEPARTMENT_NAME_EMPTY    | Name rỗng hoặc chỉ có whitespace  | 400         |
| DEPARTMENT_HAS_EMPLOYEES | Xóa department có nhân viên       | 400         |
| DEPARTMENT_HAS_CHILDREN  | Xóa department có sub-departments | 400         |
| CIRCULAR_REFERENCE       | Parent tạo vòng lặp               | 400         |
| MANAGER_NOT_FOUND        | Manager ID không tồn tại          | 404         |

## Testing Strategy

### Unit Tests

- Test validation logic (empty name, duplicate code)
- Test circular reference detection
- Test deletion constraints
- Test default approver selection logic

### Property-Based Tests

- **Property 1**: Generate random valid department data, create, then verify all fields match
- **Property 2**: Generate multiple departments, verify no duplicate codes
- **Property 4**: Generate department hierarchies, verify no cycles
- **Property 6**: Generate departments with/without employees, verify deletion behavior
- **Property 9**: Generate employees with various department/manager configurations, verify approver selection

### Integration Tests

- Test full CRUD flow for departments
- Test employee assignment to departments
