# Requirements Document

## Introduction

Refactor frontend Tamabee HR để hỗ trợ kiến trúc multi-tenant với dynamic sidebar dựa trên plan features và user role. Đồng thời cập nhật registration flow để cho phép user chọn tenant domain.

## Glossary

- **Tenant_Domain**: Subdomain riêng cho mỗi công ty (ví dụ: `acme` trong `acme.tamabee.com`)
- **Plan_Feature**: Tính năng được bật/tắt theo gói dịch vụ của công ty
- **Dynamic_Sidebar**: Sidebar hiển thị menu items dựa trên plan features và user role
- **TamabeeLayout**: Layout cho Tamabee admin (không cần tenantDomain)
- **DashboardLayout**: Layout cho tenant users (cần tenantDomain)

## Requirements

### Requirement 1: Tenant Domain Registration UI

**User Story:** As a company owner, I want to choose a unique tenant domain during registration, so that my company has a dedicated subdomain.

#### Acceptance Criteria

1. WHEN a user is on Step 1 of registration, THE Form SHALL display a tenant domain input field with `.tamabee.com` suffix
2. WHEN a user types in tenant domain field, THE System SHALL validate format (lowercase, numbers, hyphens, 3-30 chars) in real-time
3. WHEN a user stops typing for 500ms, THE System SHALL call API to check domain availability
4. WHEN domain is available, THE System SHALL display green checkmark with "Domain khả dụng" message
5. WHEN domain is taken or reserved, THE System SHALL display red X with error message and disable "Tiếp tục" button
6. WHEN user reaches Step 4 confirmation, THE System SHALL display the chosen tenant domain

### Requirement 2: Layout Restructure

**User Story:** As a frontend developer, I want to consolidate layouts into 2 main layouts, so that code is easier to maintain.

#### Acceptance Criteria

1. THE System SHALL have TamabeeLayout for /admin/\* routes (Tamabee platform management: companies, deposits, plans)
2. THE System SHALL have DashboardLayout for /dashboard/\* routes (HR features cho tất cả companies kể cả Tamabee)
3. WHEN a Tamabee admin accesses /admin/\*, THE System SHALL show platform management features
4. WHEN any user (kể cả Tamabee employees) accesses /dashboard/\*, THE System SHALL show HR features (attendance, payroll, leaves)
5. THE System SHALL treat Tamabee as a special tenant với tenantDomain = "tamabee" (companyId = 0)
6. WHEN a Tamabee user logs in, THE System SHALL set tenantDomain = "tamabee" trong JWT
7. THE System SHALL migrate /tamabee/\* platform pages (companies, deposits) to /admin/\*
8. THE System SHALL migrate /tamabee/\*, /company/\*, /employee/\* HR pages to /dashboard/\*

### Requirement 3: Dynamic Sidebar

**User Story:** As a tenant user, I want to see only menu items relevant to my plan and role, so that I have a clean navigation experience.

#### Acceptance Criteria

1. WHEN a user logs in, THE Frontend SHALL fetch plan features from API and store in context
2. WHEN rendering sidebar, THE Sidebar_Component SHALL filter menu items by plan features (featureCode)
3. WHEN rendering sidebar, THE Sidebar_Component SHALL filter menu items by user role (roles array)
4. WHEN a feature is disabled by plan, THE Sidebar SHALL hide the corresponding menu item
5. WHEN a menu item requires specific roles, THE Sidebar SHALL hide it for unauthorized roles
6. THE Menu_Items configuration SHALL support nested children with their own feature/role requirements

### Requirement 4: Route Protection

**User Story:** As a security engineer, I want frontend routes to be protected based on tenant and role, so that unauthorized access is prevented.

#### Acceptance Criteria

1. WHEN accessing /admin/\* routes without ADMIN_TAMABEE or MANAGER_TAMABEE role, THE Middleware SHALL redirect to /unauthorized
2. WHEN accessing /dashboard/\* routes without valid tenantDomain in JWT (kể cả "tamabee"), THE Middleware SHALL redirect to /unauthorized
3. WHEN accessing protected routes without access token, THE Middleware SHALL redirect to /login
4. WHEN API returns 401, THE ApiClient SHALL clear token and redirect to /login
5. THE System SHALL allow Tamabee users (tenantDomain = "tamabee") to access /dashboard/\* routes

### Requirement 5: Auth Context Enhancement

**User Story:** As a frontend developer, I want auth context to include tenant information, so that components can access tenant data easily.

#### Acceptance Criteria

1. WHEN a user logs in, THE AuthContext SHALL store tenantDomain from JWT
2. WHEN a user logs in, THE AuthContext SHALL store planId from JWT
3. THE AuthContext SHALL provide tenantDomain and planId to all components via useAuth hook
4. WHEN user logs out, THE AuthContext SHALL clear all tenant-related data

### Requirement 6: Plan Features Context

**User Story:** As a frontend developer, I want a dedicated context for plan features, so that sidebar and other components can check feature availability.

#### Acceptance Criteria

1. WHEN a tenant user logs in, THE PlanFeaturesContext SHALL fetch features from API
2. THE PlanFeaturesContext SHALL provide features array via usePlanFeatures hook
3. THE PlanFeaturesContext SHALL provide hasFeature(code) helper function
4. WHEN plan features change (upgrade/downgrade), THE Context SHALL refresh features
