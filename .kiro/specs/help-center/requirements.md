# Requirements Document

## Giới thiệu

Feature này bao gồm 3 phần chính:

1. **Help Center** — Trang trung tâm hỗ trợ hiển thị hướng dẫn sử dụng hệ thống theo chủ đề và role, sử dụng nội dung tĩnh qua i18n (frontend-only).
2. **System Notification (mở rộng)** — Mở rộng hệ thống notification hiện có để hỗ trợ nội dung Markdown. Tamabee Admin/Manager tạo thông báo hệ thống gửi cross-tenant. Bao gồm trang chi tiết thông báo (Notification Detail) để hiển thị nội dung Markdown, và thông báo chào mừng kèm hướng dẫn sử dụng cho user mới.
3. **Feedback & Support** — Form gửi báo cáo, góp ý, đề xuất cải thiện tính năng hoặc yêu cầu trợ giúp từ khách hàng đến Tamabee. Nhân viên Tamabee nhận thông báo real-time kèm email, và có thể phản hồi lại người gửi.

Nội dung Markdown được lưu trong database, render ở frontend bằng `react-markdown` + Tailwind CSS.

## Glossary

- **Help_Center**: Trang trung tâm hỗ trợ, hiển thị các bài hướng dẫn sử dụng hệ thống theo chủ đề
- **Topic**: Một chủ đề hướng dẫn (ví dụ: Chấm công, Nghỉ phép, Lương)
- **Article**: Một bài hướng dẫn cụ thể trong một Topic
- **Role_Group**: Nhóm role xác định nội dung hiển thị — gồm 3 nhóm: Tamabee Staff, Company Admin/Manager, Employee
- **System_Notification**: Thông báo hệ thống dạng Markdown do Tamabee Admin/Manager tạo, lưu master copy trong master DB
- **System_Notification_Entity**: Entity lưu trữ master copy thông báo hệ thống trong master database
- **Notification_Detail**: Trang hiển thị chi tiết nội dung Markdown của một notification (khi notification có title + content)
- **Search_Engine**: Chức năng tìm kiếm bài viết theo từ khóa
- **Accordion**: Component UI mở rộng/thu gọn để hiển thị nội dung bài viết
- **Target_Audience**: Đối tượng nhận thông báo — COMPANY_ADMINS hoặc ALL_USERS
- **Feedback_Ticket**: Yêu cầu hỗ trợ, báo cáo lỗi, góp ý hoặc đề xuất tính năng từ khách hàng
- **Feedback_Entity**: Entity lưu trữ feedback ticket trong master database
- **Feedback_Reply**: Phản hồi từ nhân viên Tamabee cho một Feedback_Ticket
- **Feedback_Type**: Loại feedback — BUG_REPORT, FEATURE_REQUEST, GENERAL_FEEDBACK, SUPPORT_REQUEST

## Requirements

### Requirement 1: Hiển thị danh sách chủ đề hướng dẫn

**User Story:** Là một người dùng, tôi muốn xem danh sách các chủ đề hướng dẫn, để tôi có thể nhanh chóng tìm được nội dung cần thiết.

#### Acceptance Criteria

1. WHEN người dùng truy cập trang Help_Center, THE Help_Center SHALL hiển thị danh sách các Topic dưới dạng navigation sidebar (GlassNav) ở bên trái và nội dung bài viết ở bên phải
2. WHEN người dùng chọn một Topic từ sidebar, THE Help_Center SHALL hiển thị danh sách các Article thuộc Topic đó
3. THE Help_Center SHALL hiển thị mỗi Topic kèm icon và tên chủ đề được dịch theo locale hiện tại
4. WHEN trang Help_Center được tải lần đầu, THE Help_Center SHALL tự động chọn Topic đầu tiên trong danh sách

### Requirement 2: Hiển thị nội dung bài viết theo dạng Accordion

**User Story:** Là một người dùng, tôi muốn xem nội dung hướng dẫn theo dạng câu hỏi - trả lời có thể mở rộng, để tôi dễ dàng tìm và đọc thông tin cần thiết.

#### Acceptance Criteria

1. THE Help_Center SHALL hiển thị mỗi Article dưới dạng Accordion với tiêu đề có thể click để mở rộng/thu gọn
2. WHEN người dùng click vào tiêu đề Article, THE Help_Center SHALL mở rộng nội dung Article đó và thu gọn các Article khác đang mở
3. THE Help_Center SHALL hiển thị nội dung Article hỗ trợ định dạng rich text bao gồm: đoạn văn, danh sách có thứ tự, danh sách không thứ tự, và text in đậm/in nghiêng
4. WHEN nội dung Article chứa các bước thực hiện, THE Help_Center SHALL hiển thị các bước dưới dạng danh sách có đánh số rõ ràng

### Requirement 3: Lọc nội dung theo role người dùng

**User Story:** Là một người dùng, tôi muốn chỉ xem các hướng dẫn phù hợp với vai trò của mình, để tôi không bị rối bởi nội dung không liên quan.

#### Acceptance Criteria

1. THE Help_Center SHALL lọc danh sách Topic và Article dựa trên Role_Group của người dùng đang đăng nhập
2. WHEN người dùng thuộc Role_Group "Employee" (EMPLOYEE_COMPANY), THE Help_Center SHALL chỉ hiển thị các hướng dẫn liên quan đến: chấm công cá nhân, xin nghỉ phép, xem lương, hồ sơ cá nhân
3. WHEN người dùng thuộc Role_Group "Company Admin/Manager" (ADMIN_COMPANY, MANAGER_COMPANY), THE Help_Center SHALL hiển thị các hướng dẫn quản lý: tạo nhân viên, quản lý chấm công, duyệt nghỉ phép, quản lý lương, cài đặt công ty, và tất cả nội dung của Employee
4. WHEN người dùng thuộc Role_Group "Tamabee Staff", THE Help_Center SHALL hiển thị các hướng dẫn quản trị platform: quản lý công ty, nạp tiền, gói dịch vụ, và tất cả nội dung của Company Admin/Manager
5. IF role của người dùng không xác định được, THEN THE Help_Center SHALL hiển thị nội dung mặc định của Role_Group "Employee"

### Requirement 4: Tìm kiếm bài viết

**User Story:** Là một người dùng, tôi muốn tìm kiếm bài viết theo từ khóa, để tôi có thể nhanh chóng tìm được hướng dẫn cụ thể mà không cần duyệt qua từng chủ đề.

#### Acceptance Criteria

1. THE Help_Center SHALL hiển thị ô tìm kiếm ở phía trên khu vực nội dung
2. WHEN người dùng nhập từ khóa vào ô tìm kiếm, THE Search_Engine SHALL lọc và hiển thị các Article có tiêu đề hoặc nội dung chứa từ khóa đó (không phân biệt hoa thường)
3. WHEN kết quả tìm kiếm trả về, THE Help_Center SHALL hiển thị kết quả gộp từ tất cả các Topic, kèm tên Topic của mỗi Article
4. WHEN không có kết quả tìm kiếm, THE Help_Center SHALL hiển thị thông báo "Không tìm thấy kết quả" với gợi ý thử từ khóa khác
5. WHEN người dùng xóa hết từ khóa tìm kiếm, THE Help_Center SHALL quay về hiển thị danh sách Article theo Topic đang chọn

### Requirement 5: Đa ngôn ngữ (i18n)

**User Story:** Là một người dùng, tôi muốn xem hướng dẫn bằng ngôn ngữ mà tôi đã chọn, để tôi có thể hiểu nội dung một cách dễ dàng.

#### Acceptance Criteria

1. THE Help_Center SHALL hiển thị tất cả nội dung (tiêu đề Topic, tiêu đề Article, nội dung Article, placeholder tìm kiếm, thông báo) bằng locale hiện tại của người dùng (vi, en, ja)
2. WHEN người dùng thay đổi ngôn ngữ hệ thống, THE Help_Center SHALL cập nhật toàn bộ nội dung sang ngôn ngữ mới mà không cần tải lại trang

### Requirement 6: Responsive và UI Glass Style

**User Story:** Là một người dùng, tôi muốn trang hướng dẫn hiển thị đẹp trên mọi thiết bị, để tôi có thể đọc hướng dẫn trên cả máy tính và điện thoại.

#### Acceptance Criteria

1. THE Help_Center SHALL sử dụng Glass Style design system (GlassNav, GlassSection, GlassCard) nhất quán với các trang khác trong hệ thống
2. WHILE người dùng truy cập trên màn hình desktop (md trở lên), THE Help_Center SHALL hiển thị layout 2 cột: sidebar Topic bên trái và nội dung Article bên phải
3. WHILE người dùng truy cập trên màn hình mobile (nhỏ hơn md), THE Help_Center SHALL hiển thị Topic dưới dạng GlassTabs ngang phía trên và nội dung Article phía dưới
4. THE Help_Center SHALL đảm bảo nội dung Article có khoảng cách và typography dễ đọc trên mọi kích thước màn hình

### Requirement 7: Tích hợp vào navigation hệ thống

**User Story:** Là một người dùng, tôi muốn truy cập trang hướng dẫn từ menu sidebar, để tôi có thể dễ dàng tìm thấy trang hỗ trợ.

#### Acceptance Criteria

1. THE Help_Center SHALL được đặt tại route `/me/help` trong PersonalLayout, cho phép tất cả người dùng đã đăng nhập truy cập
2. THE Help_Center SHALL có mục menu trong sidebar của PersonalLayout với icon và label phù hợp
3. THE Help_Center SHALL có title hiển thị trong header theo cấu hình HeaderConfig của PersonalLayout

### Requirement 8: Tạo và gửi thông báo hệ thống (System Notification)

**User Story:** Là một Tamabee Admin/Manager, tôi muốn tạo và gửi thông báo hệ thống dạng Markdown đến các Company Admin hoặc toàn bộ user, để tôi có thể thông báo bảo trì, cập nhật chính sách, hoặc hướng dẫn quan trọng.

#### Acceptance Criteria

1. THE System_Notification_Entity SHALL lưu trữ master copy nội dung Markdown trong master database với các trường: id, title, content (Markdown text), target_audience (COMPANY_ADMINS hoặc ALL_USERS), created_by, created_at, updated_at
2. WHEN Tamabee Admin/Manager tạo System_Notification mới, THE System SHALL hiển thị form soạn thảo với trường tiêu đề, nội dung Markdown, và lựa chọn Target_Audience
3. WHEN Tamabee Admin/Manager gửi System_Notification, THE System SHALL lưu master copy vào system_notifications table và tạo notification (với title + content) cho tất cả user thuộc Target_Audience trên tất cả tenant, với targetUrl trỏ đến trang Notification_Detail
4. THE System SHALL sử dụng NotificationType.SYSTEM và NotificationCode.SYSTEM_ANNOUNCEMENT cho các thông báo hệ thống
5. WHEN gửi System_Notification đến Target_Audience "COMPANY_ADMINS", THE System SHALL gửi notification đến tất cả user có role ADMIN_COMPANY trên tất cả các tenant
6. WHEN gửi System_Notification đến Target_Audience "ALL_USERS", THE System SHALL gửi notification đến tất cả user active trên tất cả các tenant

### Requirement 9: Trang chi tiết thông báo (Notification Detail)

**User Story:** Là một người dùng, tôi muốn xem chi tiết nội dung thông báo dạng Markdown, để tôi có thể đọc đầy đủ thông tin hướng dẫn hoặc thông báo hệ thống.

#### Acceptance Criteria

1. THE Notification_Detail SHALL được đặt tại route `/me/notifications/{id}` trong PersonalLayout
2. WHEN người dùng click vào notification có targetUrl trỏ đến Notification_Detail, THE System SHALL điều hướng đến trang chi tiết và hiển thị nội dung Markdown đã render
3. THE Notification_Detail SHALL render nội dung Markdown bằng `react-markdown` với Tailwind CSS typography (prose class)
4. WHEN nội dung Markdown chứa đường liên kết đến Help_Center, THE Notification_Detail SHALL render các link đó dưới dạng internal navigation (router.push) thay vì full page reload
5. THE Notification_Detail SHALL hiển thị tiêu đề thông báo, thời gian tạo, và nội dung Markdown
6. IF thông báo không tồn tại hoặc không thuộc về người dùng hiện tại, THEN THE Notification_Detail SHALL hiển thị thông báo lỗi phù hợp

### Requirement 10: Thông báo chào mừng kèm hướng dẫn sử dụng

**User Story:** Là một user mới (company hoặc employee), tôi muốn nhận thông báo chào mừng kèm hướng dẫn sử dụng cơ bản, để tôi có thể bắt đầu sử dụng hệ thống một cách hiệu quả.

#### Acceptance Criteria

1. WHEN một company mới được tạo thành công, THE System SHALL gửi notification chào mừng cho Company Admin với code WELCOME_COMPANY và targetUrl trỏ đến trang Notification_Detail
2. WHEN một employee mới được tạo thành công, THE System SHALL gửi notification chào mừng cho employee đó với code WELCOME_EMPLOYEE và targetUrl trỏ đến trang Notification_Detail
3. THE Notification_Detail SHALL render nội dung hướng dẫn chào mừng từ i18n template (frontend-only) khi phát hiện notification có code WELCOME_COMPANY hoặc WELCOME_EMPLOYEE, bao gồm các bước hướng dẫn và đường liên kết đến Help_Center
4. THE System SHALL hiển thị nội dung chào mừng theo locale hiện tại của user, tự động chuyển ngôn ngữ khi user đổi locale

### Requirement 11: Quản lý danh sách thông báo hệ thống

**User Story:** Là một Tamabee Admin/Manager, tôi muốn xem và quản lý danh sách các thông báo hệ thống đã tạo, để tôi có thể theo dõi lịch sử thông báo.

#### Acceptance Criteria

1. THE System SHALL hiển thị trang quản lý System_Notification tại route `/admin/system-notifications` trong TamabeeLayout
2. THE System SHALL hiển thị danh sách System_Notification với các cột: tiêu đề, đối tượng nhận, người tạo, thời gian tạo
3. WHEN Tamabee Admin/Manager click vào một System_Notification, THE System SHALL hiển thị chi tiết nội dung Markdown đã render
4. THE System SHALL hỗ trợ phân trang cho danh sách System_Notification

### Requirement 12: Gửi feedback và yêu cầu hỗ trợ

**User Story:** Là một người dùng (Company Admin/Manager/Employee), tôi muốn gửi báo cáo lỗi, góp ý, đề xuất tính năng hoặc yêu cầu trợ giúp đến Tamabee, để tôi có thể nhận được hỗ trợ kịp thời.

#### Acceptance Criteria

1. THE Help_Center SHALL hiển thị nút "Gửi góp ý / Yêu cầu hỗ trợ" trên trang Help_Center, mở form gửi feedback
2. THE System SHALL hiển thị form feedback với các trường: loại feedback (Feedback_Type), tiêu đề, nội dung mô tả (textarea), và ảnh đính kèm (tùy chọn, tối đa 3 ảnh)
3. THE System SHALL tự động lấy thông tin người gửi (userId, email, tên, company) từ JWT token mà không yêu cầu nhập lại
4. WHEN người dùng gửi feedback thành công, THE System SHALL lưu Feedback_Entity vào master database với trạng thái OPEN
5. WHEN feedback được gửi thành công, THE System SHALL gửi notification real-time đến tất cả nhân viên Tamabee (ADMIN_TAMABEE, MANAGER_TAMABEE, EMPLOYEE_TAMABEE) kèm theo email thông báo
6. THE Feedback_Entity SHALL lưu trữ trong master database với các trường: id, user_id, tenant_domain, user_name, user_email, company_name, type (Feedback_Type), title, description, attachment_urls (JSON array), status (OPEN, IN_PROGRESS, RESOLVED, CLOSED), created_at, updated_at

### Requirement 13: Phản hồi feedback từ Tamabee Staff

**User Story:** Là một nhân viên Tamabee, tôi muốn xem và phản hồi các feedback từ khách hàng, để tôi có thể hỗ trợ khách hàng kịp thời.

#### Acceptance Criteria

1. THE System SHALL hiển thị trang quản lý feedback tại route `/admin/feedbacks` trong TamabeeLayout
2. THE System SHALL hiển thị danh sách Feedback_Ticket với các cột: loại, tiêu đề, người gửi, công ty, trạng thái, thời gian tạo
3. WHEN nhân viên Tamabee click vào một Feedback_Ticket, THE System SHALL hiển thị chi tiết feedback bao gồm nội dung, ảnh đính kèm, và danh sách các Feedback_Reply
4. WHEN nhân viên Tamabee gửi phản hồi, THE System SHALL lưu Feedback_Reply kèm thông tin người phản hồi (replied_by_user_id, replied_by_name) và gửi notification đến người gửi feedback ban đầu thông báo có phản hồi mới
5. THE System SHALL cho phép nhân viên Tamabee cập nhật trạng thái Feedback_Ticket (OPEN → IN_PROGRESS → RESOLVED → CLOSED)
6. THE System SHALL hỗ trợ lọc danh sách feedback theo trạng thái và loại feedback
7. THE System SHALL hỗ trợ phân trang cho danh sách feedback
8. THE System SHALL hiển thị tên người phản hồi (nhân viên Tamabee) bên cạnh mỗi Feedback_Reply để Tamabee Admin/Manager có thể theo dõi ai đang xử lý feedback

### Requirement 14: Xem lịch sử feedback của người dùng

**User Story:** Là một người dùng, tôi muốn xem lại các feedback đã gửi và phản hồi từ Tamabee, để tôi có thể theo dõi tiến trình xử lý.

#### Acceptance Criteria

1. THE System SHALL hiển thị danh sách feedback đã gửi của người dùng tại route `/me/help/feedbacks` trong PersonalLayout
2. THE System SHALL hiển thị mỗi feedback với: loại, tiêu đề, trạng thái, thời gian tạo
3. WHEN người dùng click vào một feedback, THE System SHALL hiển thị chi tiết feedback bao gồm nội dung, ảnh đính kèm, và danh sách phản hồi từ Tamabee
4. WHEN có phản hồi mới từ Tamabee, THE System SHALL gửi notification đến người dùng với targetUrl trỏ đến trang chi tiết feedback
