# Implementation Plan: Header Refactor

## Overview

- Refactor header components across PersonalLayout, DashboardLayout, and TamabeeLayout to use a shared `_layout-header.tsx` component. Remove BreadcrumbRouter and ToggleTheme from headers. Update page content to remove duplicate titles.

- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Create shared Layout Header component
  - [x] 1.1 Create `_components/_base/_layout-header.tsx` with DesktopHeader and MobileHeader
    - Define HeaderConfig interface with mainPages map and namespace
    - Implement useHeaderInfo hook to determine title vs back button
    - DesktopHeader: SidebarTrigger + Separator + (Title or BackButton)
    - MobileHeader: Logo + Avatar Dropdown (user info, dashboard link for admin/manager, settings, logout)
    - No ToggleTheme in either header
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 1.2 Update `_components/_base/_back-button.tsx` if needed
    - Ensure it uses `common.back` translation key
    - Verify ghost variant and small size styling
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2. Add translation keys for header titles
  - [x] 2.1 Update `messages/vi/portal.json` with title keys
    - Add home.title, schedule.title, leave.title, payroll.title, profile.title, contract.title, documents.title, attendance.title, adjustments.title, commissions.title
    - _Requirements: 9.2_

  - [x] 2.2 Update `messages/vi/dashboard.json` with title keys
    - Add home.title, employees.title, attendance.title, payroll.title, settings.title, leaves.title, contracts.title, shifts.title, holidays.title, departments.title, adjustments.title, reports.title, profile.title, wallet.title, plans.title, support.title, payslip.title
    - _Requirements: 9.2_

  - [x] 2.3 Update `messages/vi/admin.json` with title keys
    - Add dashboard.title, companies.title, deposits.title, plans.title, settings.title, billing.title, schedulers.title
    - _Requirements: 9.2_

  - [x] 2.4 Update `messages/vi/common.json` with back key
    - Add "back": "Quay lại"
    - _Requirements: 9.3_

  - [x] 2.5 Update `messages/vi/header.json` with menu keys
    - Add settings, logout, menu.dashboard keys
    - _Requirements: 9.4_

  - [x] 2.6 Update `messages/en/*.json` with same keys (English translations)
    - _Requirements: 9.2, 9.3, 9.4_

  - [x] 2.7 Update `messages/ja/*.json` with same keys (Japanese translations)
    - _Requirements: 9.2, 9.3, 9.4_

- [x] 3. Refactor PersonalLayout
  - [x] 3.1 Update `(PersonalLayout)/layout.tsx` to use shared Layout_Header
    - Import DesktopHeader, MobileHeader from `_components/_base/_layout-header`
    - Define personalHeaderConfig with mainPages map
    - Remove old header imports from `_components/_layout-header`
    - _Requirements: 5.1, 5.2_

  - [x] 3.2 Delete `(PersonalLayout)/_components/_layout-header.tsx`
    - Remove the old PersonalLayout-specific header file
    - _Requirements: 5.1_

- [x] 4. Refactor DashboardLayout
  - [x] 4.1 Update `(DashboardLayout)/layout.tsx` to use shared Layout_Header
    - Import DesktopHeader, MobileHeader from `_components/_base/_layout-header`
    - Define dashboardHeaderConfig with mainPages map
    - Remove ToggleTheme import and usage
    - Remove BreadcrumbRouter import and usage
    - Remove Separator import if no longer needed
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Refactor TamabeeLayout
  - [x] 5.1 Update `(TamabeeLayout)/layout.tsx` to use shared Layout_Header
    - Import DesktopHeader, MobileHeader from `_components/_base/_layout-header`
    - Define tamabeeHeaderConfig with mainPages map
    - Remove ToggleTheme import and usage
    - Remove BreadcrumbRouter import and usage
    - Remove Separator import if no longer needed
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. Delete BreadcrumbRouter component
  - [x] 6.1 Delete `_components/_shared/layout/_breadcrumb-router.tsx`
    - Remove the file completely
    - _Requirements: 10.1_

  - [x] 6.2 Search and remove any remaining BreadcrumbRouter imports
    - Check all files for BreadcrumbRouter imports
    - Remove any found imports
    - _Requirements: 10.4_

- [x] 7. Checkpoint - Verify layouts work correctly
  - Ensure all three layouts render without errors
  - Verify header displays correctly on main pages and sub-pages
  - Test mobile header dropdown functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Remove duplicate titles from page content
  - [x] 8.1 Update PersonalLayout pages to remove title/description
    - Update `/me/schedule/page.tsx` - remove h1 and description
    - Update `/me/leave/page.tsx` - remove h1 and description if present
    - Update `/me/payroll/page.tsx` - remove h1 and description if present
    - Update `/me/profile/page.tsx` - remove h1 and description if present
    - Update `/me/contract/page.tsx` - remove h1 and description if present
    - Update `/me/documents/page.tsx` - remove h1 and description if present
    - Update `/me/attendance/page.tsx` - remove h1 and description if present
    - Update `/me/adjustments/page.tsx` - remove h1 and description if present
    - Update `/me/commissions/page.tsx` - remove h1 and description if present
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Update DashboardLayout pages to remove title/description
    - Update `/dashboard/employees/page.tsx` - remove h1
    - Update `/dashboard/attendance/page.tsx` - remove h1 if present
    - Update `/dashboard/payroll/page.tsx` - remove h1 if present
    - Update `/dashboard/settings/page.tsx` - remove h1 if present
    - Update `/dashboard/leaves/page.tsx` - remove h1 if present
    - Update `/dashboard/contracts/page.tsx` - remove h1 if present
    - Update `/dashboard/shifts/page.tsx` - remove h1 if present
    - Update `/dashboard/holidays/page.tsx` - remove h1 if present
    - Update `/dashboard/departments/page.tsx` - remove h1 if present
    - Update `/dashboard/adjustments/page.tsx` - remove h1 if present
    - Update `/dashboard/reports/page.tsx` - remove h1 if present
    - Update `/dashboard/profile/page.tsx` - remove h1 if present
    - Update `/dashboard/wallet/page.tsx` - remove h1 if present
    - Update `/dashboard/plans/page.tsx` - remove h1 if present
    - Update `/dashboard/support/page.tsx` - remove h1 if present
    - Update `/dashboard/payslip/page.tsx` - remove h1 if present
    - _Requirements: 8.1, 8.2_

  - [x] 8.3 Update TamabeeLayout pages to remove title/description
    - Update `/admin/companies/page.tsx` - remove h1
    - Update `/admin/deposits/page.tsx` - remove h1 if present
    - Update `/admin/plans/page.tsx` - remove h1 if present
    - Update `/admin/settings/page.tsx` - remove h1 if present
    - Update `/admin/billing/page.tsx` - remove h1 if present
    - Update `/admin/schedulers/page.tsx` - remove h1 if present
    - _Requirements: 8.1, 8.2_

- [x] 9. Final checkpoint - Verify all changes
  - Run TypeScript check: `npx tsc --noEmit 2>&1`
  - Verify no BreadcrumbRouter imports remain
  - Verify no duplicate titles in page content
  - Test navigation between main pages and sub-pages
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- The shared header component will be used by all three layouts
- Translation keys must be added for all three locales (vi, en, ja)
- BreadcrumbRouter is completely removed and replaced by the new header pattern
- Page content should not duplicate the title shown in the header
