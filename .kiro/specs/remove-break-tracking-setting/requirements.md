# Requirements Document

## Introduction

Loại bỏ tính năng "Theo dõi giờ giải lao" (breakTrackingEnabled) khỏi hệ thống. Hiện tại, setting này cho phép bật/tắt việc theo dõi giờ giải lao - khi tắt, hệ thống tự động trừ thời gian nghỉ mặc định; khi bật, nhân viên phải bấm giờ bắt đầu/kết thúc nghỉ thủ công. Sau khi thay đổi, tất cả nhân viên sẽ luôn phải bấm giờ giải lao thủ công.

## Glossary

- **Break_Tracking_Setting**: Cài đặt `breakTrackingEnabled` trong cấu hình giờ giải lao của công ty
- **Break_Config**: Cấu hình giờ giải lao bao gồm các thông số như thời gian mặc định, tối thiểu, tối đa
- **Break_Service**: Service xử lý logic bắt đầu/kết thúc giờ giải lao
- **Working_Hours_Calculator**: Calculator tính toán giờ làm việc có tính đến giờ giải lao
- **Company_Settings_Service**: Service quản lý cấu hình công ty
- **Break_Section_UI**: Component UI hiển thị cấu hình giờ giải lao trong trang settings

## Requirements

### Requirement 1: Xóa field breakTrackingEnabled khỏi Backend

**User Story:** As a developer, I want to remove the breakTrackingEnabled field from all backend DTOs and config classes, so that the codebase no longer supports the auto-deduct break feature.

#### Acceptance Criteria

1. THE Backend SHALL remove the `breakTrackingEnabled` field from `BreakConfig.java`
2. THE Backend SHALL remove the `breakTrackingEnabled` field from `BreakConfigRequest.java`
3. THE Backend SHALL remove the `breakTrackingEnabled` field from `BreakConfigResponse.java`
4. THE Backend SHALL remove the `breakTrackingEnabled` field from `BreakConfigMapper.java`

### Requirement 2: Cập nhật logic Backend không còn kiểm tra breakTrackingEnabled

**User Story:** As a developer, I want to update backend services to always require manual break tracking, so that the system behaves consistently without the toggle.

#### Acceptance Criteria

1. THE Break_Service SHALL remove the check for `breakTrackingEnabled` when starting a break
2. THE Working_Hours_Calculator SHALL always use actual break records instead of auto-deducting default break time
3. THE Company_Settings_Service SHALL remove the `breakTrackingEnabled` field from default settings
4. THE Default_Settings_Provider SHALL remove the `breakTrackingEnabled` field from default break config
5. THE Attendance_Service SHALL always use actual break records for calculating working hours

### Requirement 3: Xóa UI setting breakTrackingEnabled khỏi Frontend

**User Story:** As a company admin, I want the break tracking toggle removed from settings, so that I no longer see the confusing option.

#### Acceptance Criteria

1. THE Break_Section_UI SHALL remove the switch control for `breakTrackingEnabled`
2. THE Break_Section_UI SHALL remove the auto-deduct info message that displays when tracking is disabled
3. THE Break_Section_UI SHALL remove the `breakTrackingEnabled` item from the info panel explanations

### Requirement 4: Cập nhật TypeScript types

**User Story:** As a developer, I want to update TypeScript types to remove breakTrackingEnabled, so that the frontend code is consistent with the backend changes.

#### Acceptance Criteria

1. THE Frontend SHALL remove the `breakTrackingEnabled` field from `BreakConfig` interface in `attendance-config.ts`
2. THE Frontend SHALL remove the `breakTrackingEnabled` field from default break config in `_settings-tabs.tsx`

### Requirement 5: Xóa translation keys liên quan

**User Story:** As a developer, I want to remove unused translation keys, so that the translation files are clean and maintainable.

#### Acceptance Criteria

1. THE Frontend SHALL remove the `break.breakTrackingEnabled` translation key from Vietnamese translation file
2. THE Frontend SHALL remove the `break.breakTrackingTooltip` translation key from Vietnamese translation file
3. THE Frontend SHALL remove the `break.autoDeductInfo` translation key from Vietnamese translation file
4. THE Frontend SHALL remove the corresponding translation keys from English translation file
5. THE Frontend SHALL remove the corresponding translation keys from Japanese translation file
