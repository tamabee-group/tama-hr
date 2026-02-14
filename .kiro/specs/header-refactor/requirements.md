# Requirements Document

## Introduction

Refactor header components across all layouts (PersonalLayout, DashboardLayout, TamabeeLayout) to use a shared header component. The new header will display page titles for main pages (level 1) and a back button for sub-pages (level 2+). Mobile header will show logo and avatar dropdown menu. Toggle theme button will be removed from header.

## Glossary

- **Layout_Header**: Shared header component used across PersonalLayout, DashboardLayout, and TamabeeLayout
- **Desktop_Header**: Header displayed on desktop screens (md and above)
- **Mobile_Header**: Header displayed on mobile screens (below md breakpoint)
- **Main_Page**: Level 1 pages that are direct children of layout routes (e.g., /me, /dashboard, /admin/companies)
- **Sub_Page**: Level 2+ pages that are nested under main pages (e.g., /me/attendance/[date], /dashboard/employees/[id])
- **Back_Button**: Navigation component that returns user to previous page using router.back()
- **Avatar_Dropdown**: Dropdown menu triggered by user avatar showing user info and actions

## Requirements

### Requirement 1: Shared Layout Header Component

**User Story:** As a developer, I want a shared header component for all admin layouts, so that I can maintain consistent header behavior across the application.

#### Acceptance Criteria

1. THE Layout_Header SHALL be created at `_components/_base/_layout-header.tsx`
2. THE Layout_Header SHALL export DesktopHeader and MobileHeader components
3. THE Layout_Header SHALL accept configuration props for determining page titles and navigation behavior
4. THE Layout_Header SHALL be reusable across PersonalLayout, DashboardLayout, and TamabeeLayout

### Requirement 2: Desktop Header Behavior

**User Story:** As a user, I want to see the page title on main pages and a back button on sub-pages, so that I can easily navigate the application.

#### Acceptance Criteria

1. WHEN viewing a Main_Page, THE Desktop_Header SHALL display the page title with `text-lg font-semibold` styling
2. WHEN viewing a Sub_Page, THE Desktop_Header SHALL display a Back_Button instead of the page title
3. THE Desktop_Header SHALL include a SidebarTrigger button on the left side
4. THE Desktop_Header SHALL NOT include a toggle theme button
5. THE Desktop_Header SHALL be sticky at the top with `z-10` positioning
6. THE Desktop_Header SHALL have a height of 50px with border-bottom styling

### Requirement 3: Mobile Header Behavior

**User Story:** As a mobile user, I want to see the logo and access my profile menu, so that I can navigate and manage my account on mobile devices.

#### Acceptance Criteria

1. THE Mobile_Header SHALL display the Tamabee logo on the left side
2. THE Mobile_Header SHALL display an Avatar_Dropdown on the right side
3. WHEN the Avatar_Dropdown is opened, THE Mobile_Header SHALL show user name, email, and role
4. WHEN the user has Admin or Manager role, THE Avatar_Dropdown SHALL include a link to dashboard
5. THE Avatar_Dropdown SHALL include settings and logout options
6. THE Mobile_Header SHALL NOT include a toggle theme button
7. THE Mobile_Header SHALL only be visible on screens below md breakpoint

### Requirement 4: Back Button Component

**User Story:** As a user, I want a consistent back button across all sub-pages, so that I can easily return to the previous page.

#### Acceptance Criteria

1. THE Back_Button SHALL be located at `_components/_base/_back-button.tsx`
2. WHEN clicked, THE Back_Button SHALL navigate to the previous page using router.back()
3. THE Back_Button SHALL display a chevron-left icon and localized "back" text
4. THE Back_Button SHALL use ghost variant with small size styling

### Requirement 5: Layout Integration - PersonalLayout

**User Story:** As a developer, I want PersonalLayout to use the shared header, so that personal pages have consistent header behavior.

#### Acceptance Criteria

1. THE PersonalLayout SHALL import and use the shared Layout_Header component
2. THE PersonalLayout SHALL configure main pages as: /me, /me/schedule, /me/leave, /me/payroll, /me/profile, /me/contract, /me/documents, /me/attendance, /me/adjustments, /me/commissions
3. WHEN on a main page, THE PersonalLayout SHALL display the page title in the header
4. WHEN on a sub-page (e.g., /me/attendance/[date]), THE PersonalLayout SHALL display the Back_Button

### Requirement 6: Layout Integration - DashboardLayout

**User Story:** As a developer, I want DashboardLayout to use the shared header, so that dashboard pages have consistent header behavior.

#### Acceptance Criteria

1. THE DashboardLayout SHALL import and use the shared Layout_Header component
2. THE DashboardLayout SHALL remove the ToggleTheme component from the header
3. THE DashboardLayout SHALL remove the BreadcrumbRouter from the header
4. WHEN on a main page, THE DashboardLayout SHALL display the page title in the header
5. WHEN on a sub-page, THE DashboardLayout SHALL display the Back_Button

### Requirement 7: Layout Integration - TamabeeLayout

**User Story:** As a developer, I want TamabeeLayout to use the shared header, so that admin pages have consistent header behavior.

#### Acceptance Criteria

1. THE TamabeeLayout SHALL import and use the shared Layout_Header component
2. THE TamabeeLayout SHALL remove the ToggleTheme component from the header
3. THE TamabeeLayout SHALL remove the BreadcrumbRouter from the header
4. WHEN on a main page, THE TamabeeLayout SHALL display the page title in the header
5. WHEN on a sub-page, THE TamabeeLayout SHALL display the Back_Button

### Requirement 8: Page Content Cleanup

**User Story:** As a developer, I want to remove duplicate title/description from page content, so that titles are only displayed in the header.

#### Acceptance Criteria

1. WHEN a page has title displayed in the header, THE page content SHALL NOT include a duplicate title
2. THE page content SHALL NOT include description text that duplicates header information
3. IF a page needs additional context, THE page content MAY include a description below the main content area

### Requirement 10: Remove BreadcrumbRouter Component

**User Story:** As a developer, I want to remove the BreadcrumbRouter component since it's no longer needed with the new header pattern.

#### Acceptance Criteria

1. THE BreadcrumbRouter component file SHALL be deleted from `_components/_shared/layout/_breadcrumb-router.tsx`
2. THE DashboardLayout SHALL remove all imports and usage of BreadcrumbRouter
3. THE TamabeeLayout SHALL remove all imports and usage of BreadcrumbRouter
4. IF any other components import BreadcrumbRouter, THEN those imports SHALL be removed

### Requirement 9: Internationalization Support

**User Story:** As a user, I want header text to be displayed in my preferred language, so that I can use the application in my native language.

#### Acceptance Criteria

1. THE Layout_Header SHALL use next-intl for all displayed text
2. THE page titles SHALL be retrieved from translation files using appropriate namespace keys
3. THE Back_Button text SHALL be retrieved from the "common" namespace
4. THE Avatar_Dropdown menu items SHALL be retrieved from the "header" namespace
