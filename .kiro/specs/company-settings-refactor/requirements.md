# Requirements Document

## Introduction

Chuyển đổi hệ thống cấu hình công ty từ lưu trữ JSONB trong một bảng `company_settings` duy nhất sang các bảng riêng biệt cho từng domain (chấm công, giải lao, lương, tăng ca, thiết bị/vị trí). Đồng thời bổ sung tính năng cấu hình nghỉ thứ 7/chủ nhật/ngày lễ cho chấm công, và xây dựng đầy đủ tính năng quản lý vị trí chấm công với tích hợp Google Maps. Phụ cấp và khấu trừ không cần xử lý vì đã có table riêng.

## Glossary

- **Settings_Migration_Service**: Service xử lý việc migrate dữ liệu từ JSONB sang các bảng mới
- **Attendance_Setting**: Entity lưu cấu hình chấm công (giờ làm việc, làm tròn, grace period, nghỉ cuối tuần/lễ)
- **Break_Setting**: Entity lưu cấu hình giờ giải lao
- **Payroll_Setting**: Entity lưu cấu hình tính lương
- **Overtime_Setting**: Entity lưu cấu hình tăng ca
- **Attendance_Location**: Entity lưu vị trí chấm công (tên, tọa độ GPS, bán kính)
- **Settings_API**: API endpoints quản lý cấu hình công ty
- **Location_API**: API endpoints quản lý vị trí chấm công
- **Settings_UI**: Giao diện cấu hình công ty trên frontend

## Requirements

### Requirement 1: Migrate cấu hình chấm công sang bảng riêng

**User Story:** As a company admin, I want attendance settings stored in a dedicated table, so that the data is structured, queryable, and easier to maintain.

#### Acceptance Criteria

1. THE Attendance_Setting SHALL store all attendance configuration fields as typed columns instead of JSONB (defaultWorkStartTime, defaultWorkEndTime, defaultBreakMinutes, rounding configs, grace periods, device/location toggles)
2. WHEN the Settings_Migration_Service runs, THE Settings_Migration_Service SHALL migrate existing attendanceConfig JSONB data into the new Attendance_Setting table without data loss
3. WHEN a company admin updates attendance settings, THE Settings_API SHALL validate and persist the data to the Attendance_Setting table
4. THE Attendance_Setting SHALL include fields for configuring weekend off days (saturdayOff, sundayOff) with boolean toggles
5. THE Attendance_Setting SHALL include a field for configuring whether public holidays are treated as days off (holidayOff boolean)

### Requirement 2: Migrate cấu hình giải lao sang bảng riêng

**User Story:** As a company admin, I want break settings stored in a dedicated table, so that break configuration is independently manageable.

#### Acceptance Criteria

1. THE Break_Setting SHALL store all break configuration fields as typed columns instead of JSONB (breakEnabled, breakType, defaultBreakMinutes, minimumBreakMinutes, maximumBreakMinutes, legal minimum settings, fixed break mode, night shift break settings)
2. WHEN the Settings_Migration_Service runs, THE Settings_Migration_Service SHALL migrate existing breakConfig JSONB data into the new Break_Setting table without data loss
3. WHEN a company admin updates break settings, THE Settings_API SHALL validate and persist the data to the Break_Setting table

### Requirement 3: Migrate cấu hình lương sang bảng riêng

**User Story:** As a company admin, I want payroll settings stored in a dedicated table, so that payroll configuration is independently manageable.

#### Acceptance Criteria

1. THE Payroll_Setting SHALL store all payroll configuration fields as typed columns instead of JSONB (defaultSalaryType, payDay, cutoffDay, salaryRounding, standardWorkingDaysPerMonth, standardWorkingHoursPerDay)
2. WHEN the Settings_Migration_Service runs, THE Settings_Migration_Service SHALL migrate existing payrollConfig JSONB data into the new Payroll_Setting table without data loss
3. WHEN a company admin updates payroll settings, THE Settings_API SHALL validate and persist the data to the Payroll_Setting table

### Requirement 4: Migrate cấu hình tăng ca sang bảng riêng

**User Story:** As a company admin, I want overtime settings stored in a dedicated table, so that overtime configuration is independently manageable.

#### Acceptance Criteria

1. THE Overtime_Setting SHALL store all overtime configuration fields as typed columns instead of JSONB (overtimeEnabled, standardWorkingHours, night time settings, all multiplier rates, legal minimum settings, approval requirement, overtime limits)
2. WHEN the Settings_Migration_Service runs, THE Settings_Migration_Service SHALL migrate existing overtimeConfig JSONB data into the new Overtime_Setting table without data loss
3. WHEN a company admin updates overtime settings, THE Settings_API SHALL validate and persist the data to the Overtime_Setting table

### Requirement 5: Quản lý vị trí chấm công với Google Maps

**User Story:** As a company admin, I want to manage attendance check-in locations with GPS coordinates, so that I can define allowed check-in areas and view them on Google Maps.

#### Acceptance Criteria

1. THE Attendance_Location SHALL store location data including name, address, latitude, longitude, and radius in meters
2. WHEN a company admin creates a new location, THE Location_API SHALL validate that latitude is between -90 and 90, longitude is between -180 and 180, and radius is greater than 0
3. WHEN a company admin views the location list, THE Settings_UI SHALL display all locations in a table with name, address, radius, and an action to open the location on Google Maps
4. WHEN a company admin clicks the Google Maps link for a location, THE Settings_UI SHALL open Google Maps centered on the location coordinates
5. WHEN a company admin creates or edits a location, THE Settings_UI SHALL provide a map picker to select coordinates visually
6. THE Attendance_Location SHALL support soft delete so that deleted locations do not appear in active queries
7. WHEN a company admin deletes a location, THE Location_API SHALL soft-delete the location record

### Requirement 6: Tích hợp Google Calendar API để lấy ngày lễ

**User Story:** As a company admin, I want the system to automatically fetch public holidays from Google Calendar API based on the company locale (Vietnam or Japan), so that I do not have to manually enter public holidays each year.

#### Acceptance Criteria

1. THE Settings_API SHALL integrate with Google Calendar API to fetch public holidays for Vietnam (vi) and Japan (ja) based on the company locale setting
2. WHEN a company admin triggers a holiday sync, THE Settings_API SHALL fetch the current year public holidays from Google Calendar API and store them in the Holiday table
3. WHEN fetching holidays, THE Settings_API SHALL use the Google Calendar API key configured in application properties
4. IF the Google Calendar API returns an error or is unavailable, THEN THE Settings_API SHALL return a descriptive error message and preserve existing holiday data
5. WHEN holidays are synced, THE Settings_UI SHALL display the synced holidays in a list with date and holiday name
6. THE Settings_API SHALL prevent duplicate holiday entries when syncing multiple times for the same year

### Requirement 7: Cập nhật frontend settings UI

**User Story:** As a company admin, I want the settings page to work seamlessly with the new table-based storage, so that I can manage all configurations through the existing UI.

#### Acceptance Criteria

1. WHEN the settings page loads, THE Settings_UI SHALL fetch data from the updated API endpoints that read from the new tables
2. WHEN a company admin saves attendance settings, THE Settings_UI SHALL include the new weekend off (saturdayOff, sundayOff) and holiday off (holidayOff) toggle fields
3. WHEN a company admin navigates to the attendance settings tab, THE Settings_UI SHALL display a location management section with CRUD operations for attendance locations
4. THE Settings_UI SHALL maintain the existing Glass UI design system for all new and modified components
5. WHEN a company admin navigates to the attendance settings tab, THE Settings_UI SHALL display a holiday sync section with a button to sync holidays from Google Calendar and a list of synced holidays

### Requirement 8: Cập nhật caching cho settings mới

**User Story:** As a developer, I want the request-scoped cache to work correctly with the new table-based settings, so that multiple reads within the same request do not cause redundant database queries.

#### Acceptance Criteria

1. THE Settings_API SHALL cache each setting entity (Attendance_Setting, Break_Setting, Payroll_Setting, Overtime_Setting) independently within the request scope
2. WHEN a setting is updated within a request, THE Settings_API SHALL invalidate the corresponding cache entry so subsequent reads return fresh data
3. WHEN multiple services read the same setting within one request, THE Settings_API SHALL serve the cached value after the first database query

### Requirement 9: Data migration và backward compatibility

**User Story:** As a developer, I want a safe migration path from JSONB to dedicated tables, so that existing data is preserved and the system remains stable during transition.

#### Acceptance Criteria

1. THE Settings_Migration_Service SHALL provide a Flyway migration script that creates the new tables and migrates data from JSONB columns
2. WHEN the migration script runs, THE Settings_Migration_Service SHALL handle null JSONB columns by inserting default values into the new tables
3. IF the migration encounters invalid JSONB data, THEN THE Settings_Migration_Service SHALL log the error and apply default values for the affected record
4. WHEN all data is migrated, THE Settings_Migration_Service SHALL remove the JSONB columns from the company_settings table (giữ lại bảng company_settings cho soft delete flag và base fields)
