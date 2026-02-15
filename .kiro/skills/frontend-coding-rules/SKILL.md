---
name: Frontend Coding Rules
description: Frontend coding conventions - API calls, forms, i18n, formatting, tables, image upload, comments
---

# Frontend Coding Rules

## API & Navigation

- Client: `apiClient` từ `@/lib/utils/fetch-client`
- Server: `apiServer` từ `@/lib/utils/fetch-server`
- Navigation: `router.push()` hoặc `<Link>`, KHÔNG dùng `window.location.href`

## Components

- Max 250 lines/component, tách nhỏ khi cần
- `BaseTable` cho data tables, `BaseSidebar` cho navigation
- Shadcn/ui: `npx shadcn@latest add <component>` (KHÔNG dùng `-y`)
- **Dialog**: KHÔNG gọi API trong dialog, truyền data qua props từ page. Fetch data ở page/parent component rồi truyền vào dialog.

## Forms

- KHÔNG dùng `react-hook-form`, dùng `useState`
- Controlled components với `value` và `onChange`
- Error state: `useState<Record<string, string>>({})`

## i18n (next-intl)

- Locales: `vi`, `en`, `ja`
- **Max 3 levels**: `namespace.group.key`
- Client: `useTranslations("namespace")`
- Server: `await getTranslations("namespace")`
- KHÔNG hardcode text, KHÔNG inline labels pattern
- Enum translations: `getEnumLabel("enumName", value, tEnums)`
- Error translations: `getErrorMessage(errorCode, tErrors)`
- Khi update file translation: kiểm tra và xóa các key không còn sử dụng

```tsx
// Client
const t = useTranslations("deposits");
const tEnums = useTranslations("enums");

// Server
const t = await getTranslations("deposits");
```

## Formatting

- **Date & Time**: Tất cả format liên quan đến ngày tháng và thời gian PHẢI dùng functions từ `@/lib/utils/format-date-time`:
  - `formatDate()` - Format ngày (dd/MM/yyyy)
  - `formatDateTime()` - Format ngày giờ (dd/MM/yyyy HH:mm)
  - `formatDateForApi()` - Format ngày cho API (yyyy-MM-dd)
  - `formatDateWithDayOfWeek()` - Format ngày với thứ
  - `formatMinutesToTime()` - Format phút thành giờ (vi/en: `HH:MM`, ja: `X時YY分`)
- **Date Manipulation**: KHÔNG dùng `toISOString()` để lấy ngày (bị lệch do UTC). Luôn dùng `getFullYear()`, `getMonth()`, `getDate()` (local timezone):

  ```tsx
  // ❌ SAI - toISOString() chuyển sang UTC, timezone +9 sẽ bị lệch ngày
  const dateStr = new Date(date).toISOString().split("T")[0];

  // ✅ ĐÚNG - dùng local timezone
  const d = new Date(date);
  const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;

  // ✅ ĐÚNG - hoặc dùng formatDateForApi() từ format-date-time.ts
  const dateStr = formatDateForApi(new Date(date));
  ```

- **Currency**:
  - `formatCurrency()` từ `@/lib/utils/format-currency` - Dùng cho tiền của Tamabee (plans, deposits, wallet) - JPY format `¥1,234`
  - `formatPayslip()` từ `@/lib/utils/format-currency` - Dùng cho tiền lương nhân viên trong company - Format theo locale từ `useAuth().user?.locale`

## Tables

- Luôn có cột STT đầu tiên: `page * pageSize + index + 1`
- Width cột STT: `w-[60px]`

## Statistics Cards

- KHÔNG dùng icons
- Màu value: green (positive), yellow (warning), blue (info), red (negative)
- Layout: `grid-cols-2 lg:grid-cols-4`

## Settings Forms

- Labels ngắn gọn khi Card title đã cung cấp context
- `InputGroup` cho inputs có đơn vị (phút, %, ¥)
- Switch trước Label

## Image Upload

- LUÔN compress sang WebP: `compressImageToWebP()`

## Comments

- Viết bằng tiếng Việt
- KHÔNG comment "Requirements"
- Chạy npx tsc --noEmit 2>&1 thay vì npx next lint
