# Implementation Plan: Company Settings Refactor

## Overview

- Chuyển đổi company settings từ JSONB sang dedicated tables, thêm tính năng weekend/holiday off, quản lý vị trí chấm công với Google Maps, và tích hợp Google Calendar API sync ngày lễ. Backend dùng Java/Spring Boot, frontend dùng Next.js/TypeScript.
- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Cập nhật Flyway migration V1 cho các bảng mới
  - [x] 1.1 Cập nhật V1 migration script thêm bảng attendance_settings, break_settings, payroll_settings, overtime_settings, attendance_locations
    - Cập nhật file V1 hiện tại (dev mode) với đầy đủ columns, indexes, default values
    - Thêm migration SQL để migrate dữ liệu từ JSONB columns sang bảng mới bằng `jsonb_extract_path_text()` và `COALESCE`
    - Xử lý null JSONB columns bằng default values
    - Drop JSONB columns từ company_settings sau khi migrate
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 2. Tạo backend entities và repositories
  - [x] 2.1 Tạo AttendanceSettingEntity với tất cả typed columns bao gồm saturdayOff, sundayOff, holidayOff
    - Tạo entity trong `entity/company/`
    - Bao gồm rounding configs, grace periods, device/location toggles, weekend/holiday off fields
    - _Requirements: 1.1, 1.4, 1.5_
  - [x] 2.2 Tạo BreakSettingEntity với fixedBreakPeriods giữ JSONB
    - Tạo entity trong `entity/company/`
    - fixedBreakPeriods dùng `@JdbcTypeCode(SqlTypes.JSON)`
    - _Requirements: 2.1_
  - [x] 2.3 Tạo PayrollSettingEntity và OvertimeSettingEntity
    - Tạo entities trong `entity/company/`
    - _Requirements: 3.1, 4.1_
  - [x] 2.4 Tạo AttendanceLocationEntity với soft delete
    - Tạo entity trong `entity/company/`
    - Bao gồm name, address, latitude, longitude, radiusMeters, isActive, deleted
    - _Requirements: 5.1, 5.6_
  - [x] 2.5 Tạo repositories cho tất cả entities mới
    - AttendanceSettingRepository, BreakSettingRepository, PayrollSettingRepository, OvertimeSettingRepository trong `repository/company/`
    - AttendanceLocationRepository trong `repository/attendance/`
    - Dùng `findByDeletedFalse` pattern cho soft delete entities
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 3. Refactor CompanySettingsService để đọc/ghi từ bảng mới
  - [x] 3.1 Cập nhật ICompanySettingsService và CompanySettingsServiceImpl
    - Thay đổi implementation để đọc/ghi từ các entity repositories thay vì JSONB
    - Giữ nguyên interface signatures để không break controller
    - Tạo default settings khi chưa có row cho tenant
    - _Requirements: 1.3, 2.3, 3.3, 4.3_
  - [x] 3.2 Tạo/cập nhật request DTOs và mappers
    - Cập nhật AttendanceConfigRequest thêm saturdayOff, sundayOff, holidayOff
    - Tạo mappers cho entity ↔ config DTO conversion
    - _Requirements: 1.3, 1.4, 1.5_
  - [ ]\* 3.3 Write property test: Settings API write/read round-trip
    - **Property 2: Settings API write/read round-trip**
    - **Validates: Requirements 1.3, 2.3, 3.3, 4.3**

- [x] 4. Cập nhật CompanySettingsCache cho từng setting riêng biệt
  - [x] 4.1 Refactor CompanySettingsCache thành per-entity caching
    - Cache từng setting entity riêng biệt (attendance, break, payroll, overtime)
    - Thêm invalidate methods cho từng loại
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]\* 4.2 Write property test: Cache invalidation correctness
    - **Property 6: Cache invalidation correctness**
    - **Validates: Requirements 8.2**

- [x] 5. Checkpoint - Backend settings refactor
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Tạo AttendanceLocation CRUD backend
  - [x] 6.1 Tạo IAttendanceLocationService và AttendanceLocationServiceImpl
    - CRUD operations với validation (lat/lng/radius ranges)
    - Soft delete implementation
    - Pageable cho list API
    - _Requirements: 5.1, 5.2, 5.6, 5.7_
  - [x] 6.2 Tạo request/response DTOs và mapper cho AttendanceLocation
    - CreateAttendanceLocationRequest, UpdateAttendanceLocationRequest, AttendanceLocationResponse
    - AttendanceLocationMapper
    - _Requirements: 5.1, 5.2_
  - [x] 6.3 Tạo AttendanceLocationController
    - CRUD endpoints tại `/api/company/settings/locations`
    - `@PreAuthorize` cho ADMIN_COMPANY
    - _Requirements: 5.2, 5.7_
  - [ ]\* 6.4 Write property test: Location coordinate and radius validation
    - **Property 3: Location coordinate and radius validation**
    - **Validates: Requirements 5.2**
  - [ ]\* 6.5 Write property test: Soft delete exclusion from active queries
    - **Property 4: Soft delete exclusion from active queries**
    - **Validates: Requirements 5.6, 5.7**

- [x] 7. Tích hợp Google Calendar API sync ngày lễ
  - [x] 7.1 Tạo IGoogleCalendarService và GoogleCalendarServiceImpl
    - Gọi Google Calendar API bằng RestTemplate
    - Map response sang Holiday entities
    - Xử lý duplicate bằng upsert (date + name unique)
    - Error handling khi API unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_
  - [x] 7.2 Thêm holiday sync endpoints vào CompanySettingsController
    - POST `/api/company/settings/holidays/sync` - Sync holidays
    - GET `/api/company/settings/holidays` - List synced holidays
    - _Requirements: 6.2, 6.5_
  - [ ]\* 7.3 Write property test: Holiday sync idempotence
    - **Property 5: Holiday sync idempotence**
    - **Validates: Requirements 6.6**

- [x] 8. Checkpoint - Backend hoàn chỉnh
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Cập nhật frontend TypeScript types và API layer
  - [x] 9.1 Cập nhật attendance-config.ts types
    - Thêm saturdayOff, sundayOff, holidayOff vào AttendanceConfig
    - Tạo AttendanceLocation type
    - Tạo HolidaySyncResponse type
    - _Requirements: 1.4, 1.5, 5.1_
  - [x] 9.2 Tạo attendance-location-api.ts
    - CRUD API functions cho locations
    - _Requirements: 5.2, 5.7_
  - [x] 9.3 Cập nhật company-settings-api.ts
    - Thêm holiday sync và list API functions
    - _Requirements: 6.2, 6.5_

- [x] 10. Cập nhật frontend Settings UI
  - [x] 10.1 Cập nhật \_attendance-config-form.tsx thêm Weekend/Holiday Off section
    - Thêm GlassSection với 3 Switch toggles (saturdayOff, sundayOff, holidayOff)
    - _Requirements: 7.2_
  - [x] 10.2 Tạo \_location-management-section.tsx
    - Table hiển thị locations với BaseTable (STT, name, address, radius, actions)
    - Nút mở Google Maps link (`https://www.google.com/maps?q={lat},{lng}`)
    - Nút thêm/sửa/xóa location
    - Dùng Glass UI design system
    - _Requirements: 5.3, 5.4, 7.3, 7.4_
  - [x] 10.3 Tạo \_location-dialog.tsx
    - Dialog tạo/sửa location với form fields (name, address, lat, lng, radius)
    - Map picker component để chọn tọa độ trên bản đồ
    - _Requirements: 5.5_
  - [x] 10.4 Tạo \_holiday-sync-section.tsx
    - Button sync holidays từ Google Calendar
    - Danh sách holidays đã sync (date, name)
    - Dùng Glass UI design system
    - _Requirements: 6.5, 7.5_
  - [x] 10.5 Cập nhật \_settings-tabs.tsx tích hợp các section mới
    - Import và render LocationManagementSection, HolidaySyncSection trong attendance tab
    - _Requirements: 7.1, 7.3, 7.5_

- [x] 11. Cập nhật i18n translation files
  - [x] 11.1 Thêm translation keys cho vi, en, ja
    - Keys cho weekend/holiday off labels
    - Keys cho location management (CRUD, table headers, validation messages)
    - Keys cho holiday sync (button, status messages, error messages)
    - _Requirements: 7.2, 7.3, 7.5_

- [x] 12. Final checkpoint - Toàn bộ hệ thống
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Backend dùng jqwik cho property-based testing
- fixedBreakPeriods giữ JSONB trong break_settings (đã confirm)
- Phụ cấp/khấu trừ không xử lý (đã có table riêng)
- Flyway migration update trực tiếp V1 (dev mode)
