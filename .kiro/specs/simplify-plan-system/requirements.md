# Requirements Document

## Giới thiệu

Đơn giản hóa hệ thống Plan/Feature của Tamabee HR. Hiện tại hệ thống có logic phức tạp với mỗi plan có các features khác nhau (ATTENDANCE, PAYROLL, LEAVE_MANAGEMENT, etc.). Yêu cầu mới là tất cả plans có cùng tính năng, chỉ khác nhau về số lượng nhân viên tối đa (max_employees) và giá.

## Glossary

- **Plan**: Gói dịch vụ subscription của Tamabee HR
- **Plan_Feature**: Mô tả tính năng hiển thị trên trang pricing (text đa ngôn ngữ)
- **Plan_Feature_Code**: Mã tính năng để kiểm tra quyền truy cập (ATTENDANCE, PAYROLL, etc.)
- **Max_Employees**: Số lượng nhân viên tối đa mà một plan cho phép
- **PlanFeaturesProvider**: React Context Provider quản lý features của plan trên frontend
- **Sidebar**: Menu điều hướng động dựa trên features của plan

## Requirements

### Requirement 1: Xóa bỏ hệ thống Feature Code

**User Story:** Là admin hệ thống, tôi muốn xóa bỏ logic kiểm tra feature theo plan, để tất cả plans có cùng tính năng và hệ thống đơn giản hơn.

#### Acceptance Criteria

1. THE Backend SHALL xóa bảng `plan_feature_codes` khỏi database schema
2. THE Backend SHALL xóa entity `PlanFeatureCodeEntity` và repository tương ứng
3. THE Backend SHALL xóa enum `FeatureCode` vì không còn cần thiết
4. THE Backend SHALL xóa service `IPlanFeaturesService` và implementation
5. THE Backend SHALL cập nhật migration V2 để không còn insert data vào `plan_feature_codes`

### Requirement 2: Đơn giản hóa bảng Plans

**User Story:** Là admin hệ thống, tôi muốn bảng plans chỉ chứa thông tin cần thiết, để dễ quản lý và bảo trì.

#### Acceptance Criteria

1. THE Backend SHALL giữ lại các trường: id, name (đa ngôn ngữ), description (đa ngôn ngữ), monthly_price, max_employees, is_active, deleted
2. THE Backend SHALL cập nhật migration V2 với data plans mới đơn giản hơn
3. WHEN hiển thị plan THEN THE System SHALL hiển thị max_employees như điểm khác biệt chính giữa các plans

### Requirement 3: Giữ lại Plan Features cho hiển thị

**User Story:** Là khách hàng, tôi muốn xem danh sách tính năng của mỗi plan trên trang pricing, để hiểu được giá trị của từng gói.

#### Acceptance Criteria

1. THE Backend SHALL giữ lại bảng `plan_features` để lưu text mô tả tính năng (đa ngôn ngữ)
2. THE Backend SHALL cập nhật migration V2 với features mô tả chung cho tất cả plans
3. WHEN hiển thị pricing THEN THE Frontend SHALL hiển thị danh sách features từ bảng `plan_features`

### Requirement 4: Xóa logic kiểm tra Feature trên Frontend

**User Story:** Là developer, tôi muốn xóa bỏ logic kiểm tra feature trên frontend, để code đơn giản và dễ bảo trì hơn.

#### Acceptance Criteria

1. THE Frontend SHALL xóa `PlanFeaturesProvider` và hook `usePlanFeatures`
2. THE Frontend SHALL xóa utility `has-feature.ts`
3. THE Frontend SHALL xóa type `PlanFeature` và `PlanFeaturesContextType`
4. THE Frontend SHALL cập nhật `DashboardLayout` để không còn filter menu theo feature
5. THE Frontend SHALL cập nhật `menu-items.ts` để xóa thuộc tính `featureCode` khỏi menu items

### Requirement 5: Cập nhật trang Pricing

**User Story:** Là khách hàng, tôi muốn xem trang pricing với thông tin rõ ràng về số nhân viên và giá, để dễ dàng chọn plan phù hợp.

#### Acceptance Criteria

1. WHEN hiển thị pricing THEN THE Frontend SHALL nhấn mạnh max_employees như điểm khác biệt chính
2. THE Frontend SHALL hiển thị danh sách features chung cho tất cả plans
3. THE Frontend SHALL giữ nguyên logic hiển thị giá và quy đổi tiền tệ

### Requirement 6: Cập nhật trang quản lý Plans (Admin)

**User Story:** Là admin Tamabee, tôi muốn quản lý plans với form đơn giản hơn, để dễ dàng tạo và chỉnh sửa plans.

#### Acceptance Criteria

1. THE Frontend SHALL xóa phần quản lý feature codes trong form tạo/sửa plan
2. THE Frontend SHALL giữ lại phần quản lý plan features (text mô tả)
3. WHEN tạo plan mới THEN THE System SHALL chỉ yêu cầu: name, description, price, max_employees

### Requirement 7: Xóa API endpoints không cần thiết

**User Story:** Là developer, tôi muốn xóa các API endpoints không còn sử dụng, để giảm complexity của hệ thống.

#### Acceptance Criteria

1. THE Backend SHALL xóa endpoint `GET /api/plans/{planId}/features` (lấy feature codes)
2. THE Frontend SHALL xóa API call `planApi.getPlanFeatures()`
3. THE Backend SHALL giữ lại endpoint `GET /api/plans` và `GET /api/plans/{planId}` với features text
