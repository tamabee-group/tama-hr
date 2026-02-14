# Requirements Document

## Giới thiệu

Chuyển đổi tất cả shadcn Card components sang glass-style components (GlassCard, GlassSection) trong dự án tama-hr để đồng nhất iOS Liquid Glass design system.

## Glossary

- **Card**: Component từ `@/components/ui/card` của shadcn/ui
- **GlassCard**: Component glass-style cho cards đơn giản, interactive cards
- **GlassSection**: Component glass-style cho form sections, settings sections có title
- **Migration_System**: Hệ thống thực hiện việc chuyển đổi từ Card sang Glass components

## Phạm vi

- **Bỏ qua**: PersonalLayout (me/) - đã chuyển đổi sang glass-style
- **Xử lý**: DashboardLayout, TamabeeLayout, Shared Components, Auth Pages, Landing Page

## Nguyên tắc chung

- Khi chuyển đổi style, tiện thể bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX
- Đảm bảo spacing, padding, margin hợp lý
- Responsive design cho các breakpoints khác nhau

## Requirements

### Requirement 1: Chuyển đổi Card trong DashboardLayout

**User Story:** Là developer, tôi muốn chuyển đổi tất cả Card components trong DashboardLayout (dashboard/) sang glass-style, để giao diện quản lý HR đồng nhất.

#### Acceptance Criteria

1. WHEN một file trong `dashboard/` sử dụng Card với CardHeader + CardTitle THEN Migration_System SHALL chuyển sang GlassSection với title prop
2. WHEN một file trong `dashboard/` sử dụng Card chỉ có CardContent THEN Migration_System SHALL chuyển sang GlassCard
3. WHEN một file trong `dashboard/` sử dụng Card trong form/settings THEN Migration_System SHALL chuyển sang GlassSection
4. WHEN một file trong `dashboard/` sử dụng Card hiển thị data/stats THEN Migration_System SHALL chuyển sang GlassCard
5. THE Migration_System SHALL cập nhật import statements từ `@/components/ui/card` sang `@/app/[locale]/_components/_glass-style`
6. THE Migration_System SHALL đảm bảo không có lỗi TypeScript sau khi chuyển đổi
7. THE Migration_System SHALL bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX

### Requirement 1.1: Cải thiện Dashboard Attendance Table

**User Story:** Là developer, tôi muốn cải thiện dashboard attendance table theo thiết kế của `me/attendance/`, để giao diện đồng nhất.

#### Acceptance Criteria

1. THE Migration_System SHALL áp dụng thiết kế scroll và cố định cột từ `me/attendance/` cho `dashboard/attendance/`
2. THE Migration_System SHALL áp dụng glass-style cho dashboard attendance table
3. THE Migration_System SHALL đảm bảo UX đồng nhất giữa me/attendance và dashboard/attendance

### Requirement 2: Chuyển đổi Card trong TamabeeLayout

**User Story:** Là developer, tôi muốn chuyển đổi tất cả Card components trong TamabeeLayout (admin/) sang glass-style, để giao diện admin đồng nhất.

#### Acceptance Criteria

1. WHEN một file trong `admin/` sử dụng Card với CardHeader + CardTitle THEN Migration_System SHALL chuyển sang GlassSection với title prop
2. WHEN một file trong `admin/` sử dụng Card chỉ có CardContent THEN Migration_System SHALL chuyển sang GlassCard
3. THE Migration_System SHALL cập nhật import statements từ `@/components/ui/card` sang `@/app/[locale]/_components/_glass-style`
4. THE Migration_System SHALL đảm bảo không có lỗi TypeScript sau khi chuyển đổi
5. THE Migration_System SHALL bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX

### Requirement 3: Chuyển đổi Card trong Shared Components

**User Story:** Là developer, tôi muốn chuyển đổi tất cả Card components trong shared components (\_components/) sang glass-style, để các component dùng chung đồng nhất.

#### Acceptance Criteria

1. WHEN một file trong `_components/` sử dụng Card với CardHeader + CardTitle THEN Migration_System SHALL chuyển sang GlassSection với title prop
2. WHEN một file trong `_components/` sử dụng Card chỉ có CardContent THEN Migration_System SHALL chuyển sang GlassCard
3. THE Migration_System SHALL cập nhật import statements từ `@/components/ui/card` sang `@/app/[locale]/_components/_glass-style`
4. THE Migration_System SHALL đảm bảo không có lỗi TypeScript sau khi chuyển đổi
5. THE Migration_System SHALL bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX

### Requirement 4: Chuyển đổi Card trong Auth Pages

**User Story:** Là developer, tôi muốn chuyển đổi tất cả Card components trong auth pages (login, register, forgot-password, reset-password) sang glass-style, để giao diện xác thực đồng nhất.

#### Acceptance Criteria

1. WHEN một file trong auth pages sử dụng Card với CardHeader + CardTitle THEN Migration_System SHALL chuyển sang GlassSection với title prop
2. WHEN một file trong auth pages sử dụng CardTitle/CardDescription riêng lẻ THEN Migration_System SHALL chuyển sang heading elements với glass styling
3. THE Migration_System SHALL cập nhật import statements từ `@/components/ui/card` sang `@/app/[locale]/_components/_glass-style`
4. THE Migration_System SHALL đảm bảo không có lỗi TypeScript sau khi chuyển đổi
5. THE Migration_System SHALL bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX

### Requirement 5: Chuyển đổi Card trong Landing Page

**User Story:** Là developer, tôi muốn chuyển đổi tất cả Card components trong landing page sang glass-style, để giao diện marketing đồng nhất.

#### Acceptance Criteria

1. WHEN một file trong landing page sử dụng Card với CardHeader + CardTitle THEN Migration_System SHALL chuyển sang GlassSection với title prop
2. WHEN một file trong landing page sử dụng Card chỉ có CardContent THEN Migration_System SHALL chuyển sang GlassCard
3. THE Migration_System SHALL cập nhật import statements từ `@/components/ui/card` sang `@/app/[locale]/_components/_glass-style`
4. THE Migration_System SHALL đảm bảo không có lỗi TypeScript sau khi chuyển đổi
5. THE Migration_System SHALL bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX

### Requirement 7: Chuyển đổi Dialog sang Glass Style

**User Story:** Là developer, tôi muốn chuyển đổi tất cả Dialog components sang glass-style, để giao diện dialog đồng nhất với design system.

#### Acceptance Criteria

1. WHEN một file sử dụng Dialog với DialogContent THEN Migration_System SHALL áp dụng glass styling cho DialogContent
2. THE Migration_System SHALL giữ nguyên DialogHeader, DialogTitle, DialogFooter structure
3. THE Migration_System SHALL đảm bảo không có lỗi TypeScript sau khi chuyển đổi
4. THE Migration_System SHALL bố trí lại bố cục và kích thước nếu chưa đạt chuẩn UI-UX

### Requirement 8: Xác minh và dọn dẹp

**User Story:** Là developer, tôi muốn xác minh rằng tất cả Card imports đã được loại bỏ và không còn sử dụng Card component từ shadcn/ui.

#### Acceptance Criteria

1. WHEN quá trình migration hoàn tất THEN Migration_System SHALL xác minh không còn import từ `@/components/ui/card` trong các file đã chuyển đổi
2. WHEN quá trình migration hoàn tất THEN Migration_System SHALL chạy TypeScript compiler để xác minh không có lỗi
3. IF có file nào còn sử dụng Card component THEN Migration_System SHALL báo cáo danh sách các file cần xử lý thêm
