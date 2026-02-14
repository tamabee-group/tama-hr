# Design Document: Remove Break Tracking Setting

## Overview

Thiết kế này mô tả việc loại bỏ tính năng `breakTrackingEnabled` khỏi hệ thống. Thay đổi này đơn giản hóa logic giờ giải lao bằng cách luôn yêu cầu nhân viên bấm giờ thủ công, loại bỏ chế độ tự động trừ thời gian nghỉ mặc định.

### Phạm vi thay đổi

**Backend (api-hr):**

- DTO: `BreakConfig.java`, `BreakConfigRequest.java`, `BreakConfigResponse.java`
- Mapper: `BreakConfigMapper.java`
- Service: `BreakServiceImpl.java`, `WorkingHoursCalculatorImpl.java`, `CompanySettingsServiceImpl.java`, `AttendanceServiceImpl.java`
- Provider: `DefaultSettingsProvider.java`

**Frontend (tama-hr):**

- Component: `_break-section.tsx`
- Types: `attendance-config.ts`
- Settings: `_settings-tabs.tsx`
- Translations: `vi/companySettings.json`, `en/companySettings.json`, `ja/companySettings.json`

## Architecture

Thay đổi này không ảnh hưởng đến kiến trúc tổng thể của hệ thống. Chỉ loại bỏ một field và logic liên quan.

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ _break-section  │    │ attendance-     │                 │
│  │ (remove switch) │    │ config.ts       │                 │
│  └─────────────────┘    │ (remove field)  │                 │
│                         └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ BreakConfig     │    │ BreakService    │                 │
│  │ (remove field)  │    │ (remove check)  │                 │
│  └─────────────────┘    └─────────────────┘                 │
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                 │
│  │ WorkingHours    │    │ Attendance      │                 │
│  │ Calculator      │    │ Service         │                 │
│  │ (remove logic)  │    │ (remove logic)  │                 │
│  └─────────────────┘    └─────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Backend Changes

#### 1. BreakConfig.java

Xóa field và Builder.Default:

```java
// XÓA:
// @Builder.Default
// private Boolean breakTrackingEnabled = false;
```

#### 2. BreakConfigRequest.java

Xóa field:

```java
// XÓA:
// private Boolean breakTrackingEnabled;
```

#### 3. BreakConfigResponse.java

Xóa field:

```java
// XÓA:
// private Boolean breakTrackingEnabled;
```

#### 4. BreakConfigMapper.java

Xóa mapping logic:

```java
// XÓA trong toResponse():
// .breakTrackingEnabled(config.getBreakTrackingEnabled())

// XÓA trong toConfig():
// .breakTrackingEnabled(request.getBreakTrackingEnabled() != null ? request.getBreakTrackingEnabled() : false)

// XÓA trong updateConfig():
// if (request.getBreakTrackingEnabled() != null) {
//     config.setBreakTrackingEnabled(request.getBreakTrackingEnabled());
// }
```

#### 5. BreakServiceImpl.java

Xóa check breakTrackingEnabled trong startBreak():

```java
// XÓA:
// if (!Boolean.TRUE.equals(config.getBreakTrackingEnabled())) {
//     throw new BadRequestException("Tracking giờ giải lao không được bật", ErrorCode.INVALID_CONFIG);
// }
```

#### 6. WorkingHoursCalculatorImpl.java

Xóa logic auto-deduct khi breakTrackingEnabled = false:

```java
// XÓA trong calculateWorkingHours():
// if (totalBreakMinutes == 0 && breakConfig != null &&
//         !Boolean.TRUE.equals(breakConfig.getBreakTrackingEnabled())) {
//     if (isNightShift && breakConfig.getNightShiftDefaultBreakMinutes() != null) {
//         totalBreakMinutes = breakConfig.getNightShiftDefaultBreakMinutes();
//     } else if (breakConfig.getDefaultBreakMinutes() != null) {
//         totalBreakMinutes = breakConfig.getDefaultBreakMinutes();
//     }
// }

// XÓA trong calculateOvernightWorkingHours():
// if (totalBreakMinutes == 0 && breakConfig != null &&
//         !Boolean.TRUE.equals(breakConfig.getBreakTrackingEnabled())) {
//     if (breakConfig.getNightShiftDefaultBreakMinutes() != null) {
//         totalBreakMinutes = breakConfig.getNightShiftDefaultBreakMinutes();
//     } else if (breakConfig.getDefaultBreakMinutes() != null) {
//         totalBreakMinutes = breakConfig.getDefaultBreakMinutes();
//     }
// }
```

#### 7. CompanySettingsServiceImpl.java

Xóa field từ default config và update logic:

```java
// XÓA trong createDefaultBreakConfig():
// .breakTrackingEnabled(false)

// XÓA trong updateBreakConfig():
// if (request.getBreakTrackingEnabled() != null) {
//     config.setBreakTrackingEnabled(request.getBreakTrackingEnabled());
// }
```

#### 8. DefaultSettingsProvider.java

Xóa field từ default config và fill logic:

```java
// XÓA trong getDefaultBreakConfig():
// .breakTrackingEnabled(false)

// XÓA trong fillMissingBreakConfigFields():
// if (config.getBreakTrackingEnabled() == null) {
//     config.setBreakTrackingEnabled(defaults.getBreakTrackingEnabled());
//     hasNullFields = true;
// }
```

#### 9. AttendanceServiceImpl.java

Xóa check breakTrackingEnabled:

```java
// XÓA:
// if (Boolean.TRUE.equals(breakConfig.getBreakTrackingEnabled()) && !breakRecords.isEmpty()) {
// Thay bằng:
// if (!breakRecords.isEmpty()) {
```

### Frontend Changes

#### 1. attendance-config.ts

Xóa field từ BreakConfig interface:

```typescript
// XÓA:
// breakTrackingEnabled: boolean;
```

#### 2. \_settings-tabs.tsx

Xóa field từ default break config:

```typescript
// XÓA:
// breakTrackingEnabled: true,
```

#### 3. \_break-section.tsx

Xóa UI elements:

- Switch control cho breakTrackingEnabled
- Label "Theo dõi giờ giải lao"
- Auto-deduct info message
- Info panel item cho breakTrackingEnabled

#### 4. Translation files (vi, en, ja)

Xóa các keys:

- `break.breakTrackingEnabled`
- `break.breakTrackingTooltip`
- `break.autoDeductInfo`

## Data Models

Không có thay đổi về data model trong database. Field `breakTrackingEnabled` được lưu trong JSONB column `breakConfig` của table `company_settings`. Sau khi deploy, các giá trị cũ sẽ bị ignore khi deserialize.

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Dựa trên prework analysis, hầu hết acceptance criteria là example tests (verify xóa field/logic cụ thể). Chỉ có 1 property quan trọng:

### Property 1: No Auto-Deduct Break Time

_For any_ attendance record với empty break records, THE Working_Hours_Calculator SHALL return totalBreakMinutes = 0, không auto-deduct default break time.

**Validates: Requirements 2.2, 2.5**

Đây là property quan trọng nhất vì nó đảm bảo hệ thống không còn tự động trừ thời gian nghỉ mặc định khi không có break records.

## Error Handling

Không có thay đổi về error handling. Các exception hiện tại vẫn được giữ nguyên:

- `BadRequestException` khi break không được bật (`breakEnabled = false`)
- `BadRequestException` khi sử dụng fixed break mode
- Các validation errors khác

Xóa exception:

- `BadRequestException("Tracking giờ giải lao không được bật", ErrorCode.INVALID_CONFIG)` - không còn cần thiết

## Testing Strategy

### Unit Tests

**Backend:**

1. Test `BreakConfig` không còn field `breakTrackingEnabled`
2. Test `BreakConfigMapper.toResponse()` không map field `breakTrackingEnabled`
3. Test `BreakServiceImpl.startBreak()` không throw exception về breakTrackingEnabled
4. Test `WorkingHoursCalculatorImpl.calculateWorkingHours()` với empty break records trả về totalBreakMinutes = 0

**Frontend:**

1. Test `_break-section.tsx` không render switch cho breakTrackingEnabled
2. TypeScript compile test - verify không có reference đến `breakTrackingEnabled`

### Property-Based Tests

**Property 1: No Auto-Deduct Break Time**

- Library: JUnit 5 với jqwik hoặc QuickTheories
- Minimum 100 iterations
- Tag: **Feature: remove-break-tracking-setting, Property 1: No Auto-Deduct Break Time**

```java
@Property
void noAutoDeductBreakTime(@ForAll LocalDateTime checkIn, @ForAll LocalDateTime checkOut) {
    // Given: empty break records
    List<BreakRecordEntity> emptyBreaks = List.of();
    BreakConfig config = BreakConfig.builder()
        .breakEnabled(true)
        .defaultBreakMinutes(60)
        .build();

    // When: calculate working hours
    WorkingHoursResult result = calculator.calculateWorkingHours(
        checkIn, checkOut, emptyBreaks, config);

    // Then: totalBreakMinutes should be 0 (no auto-deduct)
    assertThat(result.getTotalBreakMinutes()).isEqualTo(0);
}
```

### Integration Tests

Không cần integration tests mới vì đây là việc xóa feature, không thêm feature mới.
