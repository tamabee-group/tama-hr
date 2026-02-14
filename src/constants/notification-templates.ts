/**
 * Templates cho System Notification Dialog
 * Mỗi template có nội dung 3 ngôn ngữ (vi, en, ja)
 */

export interface NotificationTemplate {
  key: string;
  titleVi: string;
  titleEn: string;
  titleJa: string;
  contentVi: string;
  contentEn: string;
  contentJa: string;
  targetAudience: "COMPANY_ADMINS" | "ALL_USERS";
}

export const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    key: "maintenance",
    targetAudience: "ALL_USERS",
    titleVi: "Thông báo bảo trì hệ thống",
    titleEn: "System Maintenance Notice",
    titleJa: "システムメンテナンスのお知らせ",
    contentVi: `## Thông báo bảo trì hệ thống

Hệ thống sẽ được bảo trì vào **[ngày/giờ]** để nâng cấp và cải thiện hiệu suất.

### Thời gian dự kiến
- **Bắt đầu:** [thời gian bắt đầu]
- **Kết thúc:** [thời gian kết thúc]

### Lưu ý
- Trong thời gian bảo trì, hệ thống sẽ tạm ngưng hoạt động
- Vui lòng lưu công việc trước thời gian bảo trì
- Sau khi hoàn tất, hệ thống sẽ hoạt động bình thường

Xin lỗi vì sự bất tiện này. Cảm ơn sự thông cảm của bạn.`,
    contentEn: `## System Maintenance Notice

The system will undergo maintenance on **[date/time]** for upgrades and performance improvements.

### Estimated Schedule
- **Start:** [start time]
- **End:** [end time]

### Please Note
- The system will be temporarily unavailable during maintenance
- Please save your work before the maintenance window
- The system will resume normal operation after completion

We apologize for any inconvenience. Thank you for your understanding.`,
    contentJa: `## システムメンテナンスのお知らせ

**[日時]** にシステムのアップグレードとパフォーマンス改善のためメンテナンスを実施いたします。

### 予定時間
- **開始:** [開始時間]
- **終了:** [終了時間]

### ご注意
- メンテナンス中はシステムが一時的にご利用いただけません
- メンテナンス前に作業内容を保存してください
- 完了後、システムは通常通りご利用いただけます

ご不便をおかけして申し訳ございません。ご理解のほどよろしくお願いいたします。`,
  },
  {
    key: "update",
    targetAudience: "ALL_USERS",
    titleVi: "Cập nhật tính năng mới",
    titleEn: "New Feature Update",
    titleJa: "新機能アップデートのお知らせ",
    contentVi: `## Cập nhật tính năng mới

Chúng tôi vui mừng thông báo các tính năng mới đã được cập nhật:

### Tính năng mới
1. **[Tên tính năng 1]** — [Mô tả ngắn]
2. **[Tên tính năng 2]** — [Mô tả ngắn]

### Cải thiện
- [Cải thiện 1]
- [Cải thiện 2]

Nếu có thắc mắc, vui lòng liên hệ qua mục [Góp ý & Hỗ trợ](/me/help).`,
    contentEn: `## New Feature Update

We are excited to announce the following new features:

### New Features
1. **[Feature 1]** — [Brief description]
2. **[Feature 2]** — [Brief description]

### Improvements
- [Improvement 1]
- [Improvement 2]

If you have any questions, please contact us via [Feedback & Support](/me/help).`,
    contentJa: `## 新機能アップデートのお知らせ

以下の新機能をリリースいたしました：

### 新機能
1. **[機能1]** — [簡単な説明]
2. **[機能2]** — [簡単な説明]

### 改善点
- [改善点1]
- [改善点2]

ご質問がございましたら、[フィードバック＆サポート](/me/help)よりお問い合わせください。`,
  },
  {
    key: "policy",
    targetAudience: "COMPANY_ADMINS",
    titleVi: "Thay đổi chính sách sử dụng",
    titleEn: "Usage Policy Change",
    titleJa: "利用ポリシー変更のお知らせ",
    contentVi: `## Thay đổi chính sách sử dụng

Kính gửi Quý khách hàng,

Chúng tôi xin thông báo về việc cập nhật chính sách sử dụng dịch vụ, có hiệu lực từ **[ngày]**.

### Nội dung thay đổi
- [Thay đổi 1]
- [Thay đổi 2]

### Lưu ý quan trọng
Vui lòng xem xét các thay đổi trên. Nếu có thắc mắc, hãy liên hệ với chúng tôi qua mục [Góp ý & Hỗ trợ](/me/help).

Trân trọng,
Đội ngũ Tamabee`,
    contentEn: `## Usage Policy Change

Dear Valued Customer,

We would like to inform you about updates to our service usage policy, effective from **[date]**.

### Changes
- [Change 1]
- [Change 2]

### Important Note
Please review the changes above. If you have any questions, please contact us via [Feedback & Support](/me/help).

Best regards,
Tamabee Team`,
    contentJa: `## 利用ポリシー変更のお知らせ

お客様各位

サービス利用ポリシーの更新についてお知らせいたします。**[日付]** より適用されます。

### 変更内容
- [変更点1]
- [変更点2]

### 重要なお知らせ
上記の変更内容をご確認ください。ご質問がございましたら、[フィードバック＆サポート](/me/help)よりお問い合わせください。

よろしくお願いいたします。
Tamabeeチーム`,
  },
];
