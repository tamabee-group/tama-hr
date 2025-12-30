# Frontend Coding Rules (Next.js/TypeScript)

## Navigation

- Sử dụng `router.push()` từ `next/navigation` để chuyển trang
- Với các link tĩnh, sử dụng component `<Link>` từ `next/link`
- KHÔNG dùng `window.location.href` hoặc `<a href>`

## API Calls

- Client side: sử dụng `apiClient` từ `@/lib/utils/fetch-client`
- Server side: sử dụng `apiServer` từ `@/lib/utils/fetch-server`
- Khi gọi API phân trang, khai báo constants: `DEFAULT_PAGE`, `DEFAULT_LIMIT`

## Authentication

- Sử dụng `useAuth()` hook để truy cập thông tin user
- Không truy cập localStorage trực tiếp, sử dụng các hàm từ `@/lib/auth`

## Comments

- Viết comment bằng tiếng Việt
- Ghi chú `@client-only` hoặc `@server-only` cho các hàm chỉ dùng được ở một môi trường
- KHÔNG comment "Requirements" hoặc "Validates: Requirements" trong code

## Types & Enums

- Định nghĩa types trong `types/` directory
- Sử dụng constants từ `types/enums.ts` cho các giá trị cố định
- Derive types từ constants: `type UserRole = keyof typeof USER_ROLE_LABELS`
- KHÔNG sử dụng `any` type

## Components

- Sử dụng `BaseTable` từ `@/app/[locale]/_components/_base/base-table` cho data tables
- Sử dụng `BaseSidebar` từ `@/app/[locale]/_components/_base/base-sidebar` cho sidebar navigation
- Icon trong sidebar items là `ReactNode` (JSX element), không phải string
- Server Components by default, `'use client'` only when needed
- **File quá dài phải tách nhỏ**: Khi file component vượt quá 250 dòng, PHẢI tách thành các sub-components nhỏ hơn
  - Tách logic phức tạp thành custom hooks (`use-*.ts`)
  - Tách UI sections thành internal components (`_component-name.tsx`)
  - Mỗi component chỉ nên có 1 responsibility chính

## Statistics Cards

- KHÔNG sử dụng icons trong statistics cards - giữ giao diện gọn gàng, tránh "AI-generated" look
- Cấu trúc card đơn giản: label (text-sm text-muted-foreground) + value (text-2xl font-bold)
- Sử dụng màu sắc cho value để phân biệt ý nghĩa:
  - Xanh lá (text-green-600): số tiền, giá trị tích cực
  - Vàng (text-yellow-600): cảnh báo, chờ xử lý
  - Xanh dương (text-blue-600): thông tin, trạng thái trung lập
  - Đỏ (text-red-600): lỗi, giá trị tiêu cực
- Grid responsive: `grid-cols-2 lg:grid-cols-4`
- Card styling: `<Card className="py-2">` với `<CardContent>` (không dùng CardHeader)

```tsx
// Ví dụ chuẩn
<Card className="py-2">
  <CardContent>
    <p className="text-sm text-muted-foreground">Label</p>
    <p className="text-2xl font-bold text-green-600">Value</p>
  </CardContent>
</Card>
```

## Performance

- Use Suspense boundaries với skeleton loaders
- Lazy load heavy components với `dynamic()`
- Optimize images với `next/image`
- Debounce search inputs (500ms)

## i18n

- Locales: `vi`, `en`, `ja`
- Use `useTranslations()` hook
- Translation files in `messages/` directory

## Theme

- Support dark/light mode với `next-themes`
- Primary color: `#00b1ce`
- Use CSS variables for colors

## Currency

- Đơn vị tiền tệ mặc định: **Yên Nhật (JPY)**
- Sử dụng `formatCurrency()` từ `@/lib/utils/format-currency` với locale `ja`
- Format: `¥1,234` (không có decimal)

## Tables

- Luôn thêm cột **STT (số thứ tự)** làm cột đầu tiên
- Tính STT: `page * pageSize + index + 1`
- Header: "STT" hoặc "#"
- Width cột STT: `w-[60px]` hoặc tương đương

## Image Upload

- **LUÔN** compress ảnh sang WebP trước khi upload
- Sử dụng `compressImageToWebP()` từ `@/lib/utils/compress-image-to-webp`
- Áp dụng cho: avatar, transfer proof, và tất cả ảnh upload khác
- Giảm dung lượng file đáng kể, cải thiện performance
