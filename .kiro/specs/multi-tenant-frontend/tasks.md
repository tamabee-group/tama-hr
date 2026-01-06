# Implementation Plan: Multi-Tenant Frontend

## Overview

- Refactor frontend Tamabee HR sang kiến trúc multi-tenant với dynamic sidebar và route protection. Implementation chia thành 4 phases.

- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt

## Tasks

### Phase 1: Context và Hooks

- [x] 1. Auth Context Enhancement
  - [x] 1.1 Update AuthUser type với tenantDomain và planId
    - Sửa file `types/auth.ts`
    - Thêm tenantDomain, planId vào interface
    - _Requirements: 5.1, 5.2_

  - [x] 1.2 Update useAuth hook với helper properties
    - Sửa file `hooks/use-auth.ts`
    - Thêm isTamabeeUser, isTamabeeAdmin, isCompanyAdmin
    - _Requirements: 5.3_

  - [x] 1.3 Update AuthProvider để parse JWT và store tenant info
    - Sửa file `providers/auth-provider.tsx`
    - Parse tenantDomain, planId từ JWT
    - Clear on logout
    - _Requirements: 5.1, 5.2, 5.4_

- [x] 2. Plan Features Context
  - [x] 2.1 Tạo PlanFeature types
    - Tạo file `types/plan.ts`
    - Interface PlanFeature, PlanFeaturesContextType
    - _Requirements: 6.2_

  - [x] 2.2 Tạo PlanFeaturesContext và Provider
    - Tạo file `providers/plan-features-provider.tsx`
    - Fetch features từ API khi user login
    - _Requirements: 6.1_

  - [x] 2.3 Tạo usePlanFeatures hook
    - Tạo file `hooks/use-plan-features.ts`
    - Expose features array và hasFeature helper
    - _Requirements: 6.2, 6.3_

  - [x] 2.4 Write property tests cho hasFeature
    - **Property 7: hasFeature Helper**
    - **Validates: Requirements 6.3**

- [x] 3. Checkpoint - Verify contexts work
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Layout Restructure

- [x] 4. Tạo Layout mới
  - [x] 4.1 Tạo TamabeeLayout
    - Tạo folder `app/[locale]/(TamabeeLayout)/`
    - Layout cho /admin/\* routes
    - Sidebar với ADMIN_MENU_ITEMS
    - _Requirements: 2.1_

  - [x] 4.2 Tạo DashboardLayout
    - Tạo folder `app/[locale]/(DashboardLayout)/`
    - Layout cho /dashboard/\* routes
    - Dynamic sidebar với DASHBOARD_MENU_ITEMS
    - _Requirements: 2.2_

  - [x] 4.3 Tạo menu-items configuration
    - Tạo file `constants/menu-items.ts`
    - ADMIN_MENU_ITEMS cho platform management
    - DASHBOARD_MENU_ITEMS cho HR features
    - _Requirements: 3.2, 3.3_

- [x] 5. Dynamic Sidebar Implementation
  - [x] 5.1 Tạo filterMenuItems utility function
    - Tạo file `lib/utils/filter-menu-items.ts`
    - Filter by featureCode và roles
    - Support nested children
    - _Requirements: 3.2, 3.3, 3.6_

  - [x] 5.2 Update Sidebar component
    - Sửa file `app/[locale]/_components/_base/base-sidebar.tsx`
    - Sử dụng filterMenuItems
    - Integrate với usePlanFeatures và useAuth
    - _Requirements: 3.4, 3.5_

  - [x] 5.3 Write property tests cho sidebar filtering
    - **Property 2: Sidebar Feature Filtering**
    - **Property 3: Sidebar Role Filtering**
    - **Property 4: Nested Menu Filtering**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 6. Checkpoint - Verify layouts work
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Route Protection và Migration

- [x] 7. Route Protection Middleware
  - [x] 7.1 Update middleware.ts
    - Sửa file `middleware.ts`
    - Check role cho /admin/\* routes
    - Check tenantDomain cho /dashboard/\* routes
    - Handle Tamabee users (tenantDomain = "tamabee")
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 7.2 Update ApiClient error handling
    - Sửa file `lib/utils/fetch-client.ts`
    - Clear token và redirect on 401
    - _Requirements: 4.4_

  - [x] 7.3 Write property tests cho route protection
    - **Property 5: Admin Route Protection**
    - **Property 6: Dashboard Route Protection**
    - **Validates: Requirements 4.1, 4.2, 4.5**

- [x] 8. Page Migration
  - [x] 8.1 Migrate platform pages to /admin/\*
    - Move /tamabee/companies → /admin/companies
    - Move /tamabee/deposits → /admin/deposits
    - Move /tamabee/plans → /admin/plans
    - _Requirements: 2.7_

  - [x] 8.2 Migrate HR pages to /dashboard/\*
    - Move /tamabee/_, /company/_, /employee/_ HR pages → /dashboard/_
    - Attendance, payroll, leaves, employees, settings
    - _Requirements: 2.8_

  - [x] 8.3 Update all internal links và redirects
    - Update Link hrefs
    - Update router.push calls
    - Update redirect paths
    - _Requirements: 2.7, 2.8_

- [x] 9. Checkpoint - Verify migration complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Registration UI

- [x] 10. Tenant Domain Registration
  - [x] 10.1 Tạo TenantDomainInput component
    - Tạo file `app/[locale]/(NotFooter)/register/_tenant-domain-input.tsx`
    - Input với .tamabee.com suffix
    - Real-time format validation
    - Debounce API check (500ms)
    - Show availability status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 10.2 Tạo validateTenantDomain utility
    - Tạo file `lib/utils/validate-tenant-domain.ts`
    - Validate format: lowercase, numbers, hyphens
    - Validate length: 3-30 chars
    - Validate no leading/trailing hyphens
    - _Requirements: 1.2_

  - [x] 10.3 Write property tests cho domain validation
    - **Property 1: Tenant Domain Validation**
    - **Validates: Requirements 1.2**

  - [x] 10.4 Update Step 1 registration form
    - Sửa file `app/[locale]/(NotFooter)/register/_step-1.tsx`
    - Thêm TenantDomainInput component
    - Disable "Tiếp tục" khi domain invalid/taken
    - _Requirements: 1.1, 1.5_

  - [x] 10.5 Update Step 4 confirmation
    - Sửa file `app/[locale]/(NotFooter)/register/_step-4.tsx`
    - Hiển thị tenant domain đã chọn
    - _Requirements: 1.6_

  - [x] 10.6 Update RegisterFormData type
    - Sửa file `types/register.ts`
    - Thêm tenantDomain field
    - _Requirements: 1.1_

- [x] 11. Translations
  - [x] 11.1 Add translations cho tenant domain
    - Update `messages/vi/register.json`
    - Update `messages/en/register.json`
    - Update `messages/ja/register.json`
    - Keys: domainLabel, domainPlaceholder, domainAvailable, domainTaken, domainTooShort, domainTooLong, domainInvalidChars, domainInvalidHyphen
    - _Requirements: 1.4, 1.5_

  - [x] 11.2 Add translations cho menu items
    - Update `messages/*/menu.json`
    - Keys cho ADMIN_MENU_ITEMS và DASHBOARD_MENU_ITEMS
    - _Requirements: 3.2_

- [x] 12. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
  - Review all changes
  - Verify no regressions

## Notes

- Tasks marked with `*` are optional property-based tests
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
