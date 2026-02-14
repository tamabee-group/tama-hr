# Implementation Plan: Simplify Plan System

## Overview

- Đơn giản hóa hệ thống Plan/Feature bằng cách xóa bỏ logic kiểm tra feature theo plan. Tất cả plans sẽ có cùng tính năng, chỉ khác nhau về số lượng nhân viên (max_employees) và giá.
- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Backend - Xóa Feature Code System
  - [x] 1.1 Xóa entity `PlanFeatureCodeEntity.java`
    - Xóa file `api-hr/src/main/java/com/tamabee/api_hr/entity/wallet/PlanFeatureCodeEntity.java`
    - _Requirements: 1.2_
  - [x] 1.2 Xóa repository `PlanFeatureCodeRepository.java`
    - Xóa file `api-hr/src/main/java/com/tamabee/api_hr/repository/wallet/PlanFeatureCodeRepository.java`
    - _Requirements: 1.2_
  - [x] 1.3 Xóa enum `FeatureCode.java`
    - Xóa file `api-hr/src/main/java/com/tamabee/api_hr/enums/FeatureCode.java`
    - _Requirements: 1.3_
  - [x] 1.4 Xóa service `IPlanFeaturesService` và implementation
    - Xóa file `api-hr/src/main/java/com/tamabee/api_hr/service/core/interfaces/IPlanFeaturesService.java`
    - Xóa file `api-hr/src/main/java/com/tamabee/api_hr/service/core/impl/PlanFeaturesServiceImpl.java`
    - _Requirements: 1.4_
  - [x] 1.5 Xóa DTO `PlanFeaturesResponse.java`
    - Xóa file `api-hr/src/main/java/com/tamabee/api_hr/dto/response/wallet/PlanFeaturesResponse.java`
    - _Requirements: 1.4_
  - [x] 1.6 Xóa controller endpoint `/plans/{id}/features`
    - Tìm và xóa method trong PlanController
    - _Requirements: 7.1_
  - [x] 1.7 Xóa property test `PlanFeaturesPropertyTest.java`
    - Xóa file test liên quan đến PlanFeaturesService
    - _Requirements: 1.4_

- [x] 2. Backend - Cập nhật Migration
  - [x] 2.1 Cập nhật V1\_\_init_schema.sql
    - Xóa định nghĩa bảng `plan_feature_codes`
    - _Requirements: 1.1_
  - [x] 2.2 Cập nhật V2\_\_init_settings.sql
    - Xóa INSERT vào `plan_feature_codes`
    - Cập nhật `plan_features` với features chung cho tất cả plans
    - _Requirements: 1.5, 3.2_

- [x] 3. Checkpoint - Backend compile check
  - Chạy `./mvnw compile` để đảm bảo không có lỗi compile
  - Kiểm tra không còn reference đến FeatureCode, PlanFeatureCodeEntity

- [x] 4. Frontend - Xóa Plan Features Provider
  - [x] 4.1 Xóa file `plan-features-provider.tsx`
    - Xóa file `tama-hr/src/providers/plan-features-provider.tsx`
    - _Requirements: 4.1_
  - [x] 4.2 Xóa hook `use-plan-features.ts`
    - Xóa file `tama-hr/src/hooks/use-plan-features.ts`
    - _Requirements: 4.1_
  - [x] 4.3 Xóa utility `has-feature.ts`
    - Xóa file `tama-hr/src/lib/utils/has-feature.ts`
    - _Requirements: 4.2_
  - [x] 4.4 Cập nhật root layout
    - Xóa `PlanFeaturesProvider` khỏi `tama-hr/src/app/[locale]/layout.tsx`
    - _Requirements: 4.1_

- [x] 5. Frontend - Cập nhật DashboardLayout
  - [x] 5.1 Xóa logic filter menu theo feature
    - Cập nhật `tama-hr/src/app/[locale]/(DashboardLayout)/layout.tsx`
    - Xóa import `usePlanFeatures`
    - Xóa logic `hasFeature` trong `convertMenuGroupsToSidebarGroups`
    - _Requirements: 4.4_
  - [x] 5.2 Cập nhật menu-items.ts
    - Xóa thuộc tính `featureCode` khỏi tất cả menu items
    - Xóa interface `featureCode?: string` từ `MenuItem`
    - _Requirements: 4.5_

- [x] 6. Frontend - Cập nhật Types và API
  - [x] 6.1 Cập nhật types/plan.ts
    - Xóa `PlanFeature` interface
    - Xóa `PlanFeaturesResponse` interface
    - Xóa `PlanFeaturesContextType` interface
    - _Requirements: 4.3_
  - [x] 6.2 Cập nhật plan-api.ts
    - Xóa function `getPlanFeatures()`
    - _Requirements: 7.2_

- [x] 7. Checkpoint - Frontend compile check
  - Chạy `npx tsc --noEmit` để đảm bảo không có lỗi TypeScript
  - Kiểm tra không còn reference đến PlanFeature, usePlanFeatures

- [x] 8. Frontend - Cập nhật PersonalLayout (nếu cần)
  - [x] 8.1 Kiểm tra và cập nhật PersonalLayout
    - Kiểm tra `tama-hr/src/app/[locale]/(PersonalLayout)/layout.tsx`
    - Xóa logic filter menu theo feature nếu có
    - _Requirements: 4.4_

- [x] 9. Final Checkpoint
  - Chạy `.\mvnw compile` trong api-hr
  - Chạy `npx tsc --noEmit` trong tama-hr
  - Chạy `npx eslint .` trong tama-hr
  - Đảm bảo tất cả tests pass

## Notes

- Spec này chủ yếu là xóa code, không có logic mới cần implement
- Cần cẩn thận khi xóa để không break các phần khác của hệ thống
- Migration V2 cần được cập nhật cẩn thận vì ảnh hưởng đến database
