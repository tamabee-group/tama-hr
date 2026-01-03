# Implementation Plan: Work Schedule Redesign

## Overview

- Triển khai thiết kế lại hệ thống quản lý lịch làm việc và Company Settings với work mode selection, explanation panels, và conditional sidebar. Implementation sẽ được chia thành các phase: Backend API → Types/Utils → Components → Integration.

- Khi Kiro thực hiện task hãy phản hồi tôi bằng tiếng Việt.

## Tasks

- [x] 1. Backend API Updates (api-hr)
  - [x] 1.1 Add WorkMode field to CompanySettings entity
    - Thêm field `workMode` (enum: FIXED_HOURS, FLEXIBLE_SHIFT) vào CompanySettingsEntity
    - Thêm fields `defaultWorkStartTime`, `defaultWorkEndTime`, `defaultBreakMinutes` cho FIXED_HOURS mode
    - Tạo migration script V4\_\_add_work_mode.sql
    - _Requirements: 1.6, 2.1_

  - [x] 1.2 Create WorkModeChangeLog entity and repository
    - Tạo entity để lưu audit log khi work mode thay đổi
    - Tạo repository với method findByCompanyId
    - _Requirements: 8.4_

  - [x] 1.3 Update CompanySettings API endpoints
    - Thêm endpoint GET/PUT cho work mode config
    - Implement logic preserve schedules as inactive khi switch to FIXED_HOURS
    - Implement audit logging khi work mode thay đổi
    - _Requirements: 1.5, 1.6, 8.3, 8.4_

  - [x] 1.4 Write property test for work mode persistence
    - **Property 1: Work Mode Persistence Round-Trip**
    - **Validates: Requirements 1.6, 8.2**

  - [x] 1.5 Write property test for mode switch preserves schedules
    - **Property 9: Mode Switch Preserves Schedules as Inactive**
    - **Validates: Requirements 8.3**

- [x] 2. Checkpoint - Backend API
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 3. Frontend Types and Utils (tama-hr)
  - [x] 3.1 Update attendance-config types
    - Thêm WorkMode type và WorkModeConfig interface
    - Thêm WorkModeChangeLog interface
    - Update CompanySettings interface
    - _Requirements: 1.2_

  - [x] 3.2 Create sidebar filtering utility
    - Tạo function `filterSidebarByWorkMode(items, workMode)`
    - Return filtered items based on work mode
    - _Requirements: 2.2, 4.1, 4.2, 4.3_

  - [x] 3.3 Write property test for sidebar filtering
    - **Property 2: Sidebar Filtering by Work Mode**
    - **Validates: Requirements 2.2, 4.1**

  - [x] 3.4 Update company-settings-api
    - Thêm methods getWorkModeConfig, updateWorkModeConfig
    - _Requirements: 1.6_

- [x] 4. Checkpoint - Types and Utils
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Core UI Components
  - [x] 5.1 Create ExplanationPanel component
    - Tạo component với title, description, tips, collapsible
    - Sử dụng Collapsible từ shadcn/ui
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.2 Create WorkModeSelector component
    - Tạo 2 card lớn với icon và mô tả
    - Implement confirmation dialog khi thay đổi mode
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 5.3 Create ScheduleTimeline component
    - Hiển thị timeline 24h với working hours và breaks
    - Hỗ trợ overnight schedules
    - _Requirements: 6.6_

  - [x] 5.4 Create ScheduleSummaryCard component
    - Hiển thị work mode badge, default schedule, statistics
    - _Requirements: 6.1, 6.3_

- [x] 6. Checkpoint - Core Components
  - Ensure all components render correctly, ask the user if questions arise.

- [x] 7. Settings Page Updates
  - [x] 7.1 Update \_settings-tabs.tsx with WorkModeSelector
    - Thêm WorkModeSelector làm section đầu tiên
    - Thêm ExplanationPanel cho mỗi tab
    - _Requirements: 7.1, 7.2_

  - [x] 7.2 Implement conditional sections visibility
    - Ẩn/hiện sections dựa trên work mode
    - _Requirements: 7.3_

  - [x] 7.3 Write property test for settings sections visibility
    - **Property 7: Settings Sections Visibility by Work Mode**
    - **Validates: Requirements 7.3**

  - [x] 7.4 Add configuration summary card
    - Hiển thị tóm tắt cấu hình hiện tại
    - Highlight missing required configurations
    - _Requirements: 7.5, 7.6_

  - [x] 7.5 Write property test for incomplete settings highlighting
    - **Property 8: Incomplete Settings Highlighting**
    - **Validates: Requirements 7.5**

- [x] 8. Checkpoint - Settings Page
  - Ensure settings page works correctly with both work modes, ask the user if questions arise.

- [x] 9. Schedule Page Updates
  - [x] 9.1 Update schedule page with summary card
    - Thêm ScheduleSummaryCard ở đầu trang
    - Hiển thị work mode và default schedule
    - _Requirements: 6.1_

  - [x] 9.2 Implement schedule grouping by type
    - Group schedules theo type (FIXED, FLEXIBLE, SHIFT)
    - Hiển thị với section headers
    - _Requirements: 6.2_

  - [x] 9.3 Write property test for schedule grouping
    - **Property 5: Schedules Grouped by Type**
    - **Validates: Requirements 6.2**

  - [x] 9.4 Create ScheduleWizard component
    - 4 steps: Basic Info → Working Hours → Break Config → Review
    - Mỗi step có explanation
    - _Requirements: 6.4_

  - [x] 9.5 Update schedule form with timeline preview
    - Thêm ScheduleTimeline vào form
    - Real-time update khi thay đổi hours/breaks
    - _Requirements: 6.6_

  - [x] 9.6 Enhance break validation
    - Validate break periods within work hours
    - Show clear error messages
    - _Requirements: 6.5_

  - [x] 9.7 Write property test for break validation
    - **Property 6: Break Periods Within Work Hours Validation**
    - **Validates: Requirements 6.5**

  - [x] 9.8 Add deletion warning for schedules with assignments
    - Check assignment count before delete
    - Show warning dialog
    - _Requirements: 6.7_

- [x] 10. Checkpoint - Schedule Page
  - Ensure schedule page works correctly, ask the user if questions arise.

- [x] 11. Sidebar Updates
  - [x] 11.1 Update \_company-sidebar-items.tsx
    - Integrate sidebar filtering based on work mode
    - Fetch work mode from context/API
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 11.2 Add work mode indicator to sidebar
    - Hiển thị badge hoặc icon cho work mode hiện tại
    - _Requirements: 4.4_

- [x] 12. Shifts Page Updates
  - [x] 12.1 Update \_shifts-tabs.tsx for conditional tabs
    - Ẩn Templates tab khi FIXED_HOURS mode
    - Chỉ hiện Assignments và Swaps
    - _Requirements: 2.3, 2.4_

- [x] 13. Checkpoint - Navigation Updates
  - Ensure sidebar and shifts page work correctly with both modes, ask the user if questions arise.

- [x] 14. i18n Updates
  - [x] 14.1 Add translation keys for work mode
    - Thêm keys cho workMode section trong companySettings namespace
    - Thêm keys cho explanation panels
    - Thêm keys cho wizard steps
    - _Requirements: 1.3, 1.4, 5.2, 5.3_

- [ ] 15. Final Integration Testing
  - [ ] 15.1 Test complete flow FIXED_HOURS mode
    - Verify sidebar hides schedules
    - Verify shifts page hides templates
    - Verify attendance uses default hours
    - _Requirements: 2.1, 2.2, 2.3, 2.5_

  - [ ] 15.2 Test complete flow FLEXIBLE_SHIFT mode
    - Verify all features visible
    - Verify schedule assignment works
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

  - [ ] 15.3 Test mode switching
    - Verify confirmation dialog
    - Verify schedules preserved as inactive
    - Verify audit log created
    - _Requirements: 1.5, 8.3, 8.4_

- [ ] 16. Final Checkpoint
  - Ensure all tests pass and features work correctly, ask the user if questions arise.

## Notes

- All tasks including property-based tests are required
- Backend tasks (1.x) should be done in api-hr workspace
- Frontend tasks (3.x onwards) should be done in tama-hr workspace
- Each checkpoint ensures incremental validation
- Property tests use fast-check library with minimum 100 iterations
