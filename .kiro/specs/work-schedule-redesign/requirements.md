# Requirements Document

## Introduction

Thiết kế lại hệ thống quản lý lịch làm việc (Work Schedule) và Company Settings để dễ hiểu, logic chặt chẽ và phù hợp với nhiều loại hình doanh nghiệp. Hệ thống cần phân biệt rõ ràng giữa công ty làm việc giờ cố định (Fixed Hours) và công ty làm việc linh hoạt/theo ca (Flexible/Shift-based), từ đó tự động điều chỉnh các tính năng hiển thị và cấu hình phù hợp.

## Glossary

- **Work_Mode**: Chế độ làm việc của công ty - FIXED_HOURS (giờ cố định) hoặc FLEXIBLE_SHIFT (linh hoạt/theo ca)
- **Company_Settings**: Cấu hình chung của công ty bao gồm attendance, payroll, overtime, break, allowance, deduction
- **Work_Schedule**: Lịch làm việc định nghĩa giờ bắt đầu, kết thúc, nghỉ giải lao
- **Shift_Template**: Mẫu ca làm việc dùng để phân ca cho nhân viên
- **Shift_Assignment**: Việc gán ca làm việc cho nhân viên cụ thể
- **Feature_Sidebar**: Sidebar hiển thị các tính năng có thể sử dụng dựa trên cấu hình công ty
- **Explanation_Panel**: Khu vực giải thích cách sử dụng và ý nghĩa của các cấu hình

## Requirements

### Requirement 1: Work Mode Selection

**User Story:** As a company admin, I want to select the work mode for my company, so that the system can show relevant features and settings.

#### Acceptance Criteria

1. WHEN a company admin accesses Company Settings, THE System SHALL display a Work Mode selector at the top of the settings page
2. THE System SHALL provide two work mode options: FIXED_HOURS (Giờ cố định) and FLEXIBLE_SHIFT (Linh hoạt/Theo ca)
3. WHEN work mode is FIXED_HOURS, THE System SHALL display explanation that employees work fixed hours daily without shift scheduling
4. WHEN work mode is FLEXIBLE_SHIFT, THE System SHALL display explanation that employees can be assigned to different shifts
5. WHEN work mode changes, THE System SHALL show a confirmation dialog explaining the impact on existing configurations
6. THE System SHALL persist the selected work mode to the company settings

### Requirement 2: Fixed Hours Mode Configuration

**User Story:** As a company admin with fixed hours mode, I want to configure default working hours, so that all employees follow the same schedule.

#### Acceptance Criteria

1. WHEN work mode is FIXED_HOURS, THE System SHALL display default working hours configuration (start time, end time, break duration)
2. WHEN work mode is FIXED_HOURS, THE System SHALL hide the Schedules menu item from sidebar
3. WHEN work mode is FIXED_HOURS, THE System SHALL hide the Shift Templates tab from Shifts page
4. WHEN work mode is FIXED_HOURS, THE System SHALL still allow creating shift assignments for overtime/extra work
5. THE System SHALL apply the configured default working hours to all attendance calculations
6. WHEN an employee checks in under FIXED_HOURS mode, THE System SHALL use company default hours for attendance validation

### Requirement 3: Flexible/Shift Mode Configuration

**User Story:** As a company admin with flexible/shift mode, I want to manage multiple work schedules and shift templates, so that I can assign different schedules to different employees.

#### Acceptance Criteria

1. WHEN work mode is FLEXIBLE_SHIFT, THE System SHALL display the Schedules menu item in sidebar
2. WHEN work mode is FLEXIBLE_SHIFT, THE System SHALL display all tabs (Templates, Assignments, Swaps) in Shifts page
3. WHEN work mode is FLEXIBLE_SHIFT, THE System SHALL require at least one default schedule to be configured
4. THE System SHALL allow creating multiple work schedules with different configurations
5. THE System SHALL allow assigning schedules to employees individually or in bulk

### Requirement 4: Feature Sidebar Based on Work Mode

**User Story:** As a company admin, I want to see only relevant menu items in the sidebar, so that I don't get confused by features that don't apply to my company's work mode.

#### Acceptance Criteria

1. WHEN work mode is FIXED_HOURS, THE Sidebar SHALL hide "Lịch làm việc" (Schedules) menu item
2. WHEN work mode is FIXED_HOURS, THE Sidebar SHALL show "Ca làm việc" (Shifts) with only Assignments and Swaps tabs available
3. WHEN work mode is FLEXIBLE_SHIFT, THE Sidebar SHALL show both "Lịch làm việc" and "Ca làm việc" menu items
4. THE Sidebar SHALL display a visual indicator showing current work mode
5. WHEN user hovers over a hidden feature, THE System SHALL show tooltip explaining why it's hidden

### Requirement 5: Explanation Panels

**User Story:** As a company admin, I want to see explanations for each configuration section, so that I understand what each setting does and how to use it correctly.

#### Acceptance Criteria

1. THE System SHALL display an explanation panel at the top of each settings section
2. THE Explanation_Panel SHALL contain a brief description of the section's purpose
3. THE Explanation_Panel SHALL contain tips for common use cases
4. THE Explanation_Panel SHALL be collapsible to save screen space
5. WHEN work mode affects a section, THE Explanation_Panel SHALL explain the relationship
6. THE System SHALL provide contextual help icons with tooltips for complex fields

### Requirement 6: Work Schedule Page Redesign

**User Story:** As a company admin, I want a clearer work schedule management interface, so that I can easily create and manage schedules.

#### Acceptance Criteria

1. THE Schedule_Page SHALL display a summary card showing current work mode and default schedule
2. THE Schedule_Page SHALL group schedules by type (Fixed, Flexible, Shift)
3. THE Schedule_Page SHALL show assignment count for each schedule
4. WHEN creating a schedule, THE System SHALL provide a step-by-step wizard with explanations
5. THE Schedule_Form SHALL validate that break periods are within work hours
6. THE Schedule_Form SHALL show a visual timeline preview of the schedule
7. IF a schedule has assignments, THE System SHALL warn before allowing deletion

### Requirement 7: Settings Page Reorganization

**User Story:** As a company admin, I want a better organized settings page, so that I can find and configure settings more easily.

#### Acceptance Criteria

1. THE Settings_Page SHALL display Work Mode selector as the first section
2. THE Settings_Page SHALL group related settings into logical sections with clear headers
3. THE Settings_Page SHALL show/hide sections based on work mode where applicable
4. THE Settings_Page SHALL provide a "Quick Setup" wizard for new companies
5. WHEN settings are incomplete, THE System SHALL highlight missing required configurations
6. THE Settings_Page SHALL show a summary of current configuration at the top

### Requirement 8: Data Migration and Compatibility

**User Story:** As a system administrator, I want existing company data to be compatible with the new work mode system, so that no data is lost during the transition.

#### Acceptance Criteria

1. WHEN upgrading, THE System SHALL default existing companies to FLEXIBLE_SHIFT mode to preserve current behavior
2. THE System SHALL migrate existing default working hours to the new work mode configuration
3. IF a company switches from FLEXIBLE_SHIFT to FIXED_HOURS, THE System SHALL preserve existing schedules but mark them as inactive
4. THE System SHALL log all work mode changes for audit purposes
