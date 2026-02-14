# Implementation Plan: Remove Break Tracking Setting

## Overview

- Loại bỏ tính năng `breakTrackingEnabled` khỏi hệ thống. Thực hiện theo thứ tự: Backend DTOs → Backend Services → Frontend Types → Frontend UI → Translations.

- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Xóa field breakTrackingEnabled khỏi Backend DTOs
  - [x] 1.1 Xóa field `breakTrackingEnabled` từ `BreakConfig.java`
    - Xóa field và `@Builder.Default` annotation
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/config/BreakConfig.java`
    - _Requirements: 1.1_
  - [x] 1.2 Xóa field `breakTrackingEnabled` từ `BreakConfigRequest.java`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/request/attendance/BreakConfigRequest.java`
    - _Requirements: 1.2_
  - [x] 1.3 Xóa field `breakTrackingEnabled` từ `BreakConfigResponse.java`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/dto/response/attendance/BreakConfigResponse.java`
    - _Requirements: 1.3_

- [x] 2. Cập nhật Backend Mapper và Services
  - [x] 2.1 Xóa mapping logic từ `BreakConfigMapper.java`
    - Xóa `.breakTrackingEnabled()` trong `toResponse()`, `toConfig()`, và `updateConfig()`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/mapper/company/BreakConfigMapper.java`
    - _Requirements: 1.4_
  - [x] 2.2 Xóa check breakTrackingEnabled từ `BreakServiceImpl.java`
    - Xóa block kiểm tra `!Boolean.TRUE.equals(config.getBreakTrackingEnabled())`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/company/impl/BreakServiceImpl.java`
    - _Requirements: 2.1_
  - [x] 2.3 Xóa logic auto-deduct từ `WorkingHoursCalculatorImpl.java`
    - Xóa 2 blocks kiểm tra breakTrackingEnabled trong `calculateWorkingHours()` và `calculateOvernightWorkingHours()`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/calculator/impl/WorkingHoursCalculatorImpl.java`
    - _Requirements: 2.2_
  - [x] 2.4 Xóa field từ `CompanySettingsServiceImpl.java`
    - Xóa `.breakTrackingEnabled(false)` trong default config và update logic
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/company/impl/CompanySettingsServiceImpl.java`
    - _Requirements: 2.3_
  - [x] 2.5 Xóa field từ `DefaultSettingsProvider.java`
    - Xóa `.breakTrackingEnabled(false)` và fill logic
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/company/cache/DefaultSettingsProvider.java`
    - _Requirements: 2.4_
  - [x] 2.6 Cập nhật logic trong `AttendanceServiceImpl.java`
    - Thay `if (Boolean.TRUE.equals(breakConfig.getBreakTrackingEnabled()) && !breakRecords.isEmpty())` thành `if (!breakRecords.isEmpty())`
    - File: `api-hr/src/main/java/com/tamabee/api_hr/service/company/impl/AttendanceServiceImpl.java`
    - _Requirements: 2.5_

- [x] 3. Checkpoint - Verify Backend Changes
  - Chạy `./mvnw compile` để verify không có compile errors
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Cập nhật Frontend Types và UI
  - [x] 4.1 Xóa field từ `attendance-config.ts`
    - Xóa `breakTrackingEnabled: boolean;` từ `BreakConfig` interface
    - File: `tama-hr/src/types/attendance-config.ts`
    - _Requirements: 4.1_
  - [x] 4.2 Xóa field từ `_settings-tabs.tsx`
    - Xóa `breakTrackingEnabled: true,` từ default break config
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/settings/_settings-tabs.tsx`
    - _Requirements: 4.2_
  - [x] 4.3 Xóa UI elements từ `_break-section.tsx`
    - Xóa Switch control, Label, auto-deduct info message, và info panel item cho breakTrackingEnabled
    - File: `tama-hr/src/app/[locale]/(DashboardLayout)/dashboard/settings/_break-section.tsx`
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Xóa Translation Keys
  - [x] 5.1 Xóa keys từ Vietnamese translation
    - Xóa `break.breakTrackingEnabled`, `break.breakTrackingTooltip`, `break.autoDeductInfo`
    - File: `tama-hr/messages/vi/companySettings.json`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 5.2 Xóa keys từ English translation
    - File: `tama-hr/messages/en/companySettings.json`
    - _Requirements: 5.4_
  - [x] 5.3 Xóa keys từ Japanese translation
    - File: `tama-hr/messages/ja/companySettings.json`
    - _Requirements: 5.5_

- [x] 6. Final Checkpoint - Verify All Changes
  - Chạy `npx tsc --noEmit` để verify TypeScript không có errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Thực hiện backend trước để đảm bảo API vẫn hoạt động
- Frontend sẽ tự động ignore field `breakTrackingEnabled` trong response cũ
- Không cần database migration vì field được lưu trong JSONB
