# Frontend Coding Rules

## API & Navigation

- Client: `apiClient` từ `@/lib/utils/fetch-client`
- Server: `apiServer` từ `@/lib/utils/fetch-server`
- Navigation: `router.push()` hoặc `<Link>`, KHÔNG dùng `window.location.href`

## Components

- Max 250 lines/component, tách nhỏ khi cần
- `BaseTable` cho data tables, `BaseSidebar` cho navigation
- Shadcn/ui: `npx shadcn@latest add <component>` (KHÔNG dùng `-y`)

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

- Date: `formatDate()`, `formatDateTime()` từ `@/lib/utils/format-date`
- Currency: `formatCurrency()` - JPY format `¥1,234`
- Duration: `formatMinutesToTime()` - vi/en: `HH:MM`, ja: `X時YY分`

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
