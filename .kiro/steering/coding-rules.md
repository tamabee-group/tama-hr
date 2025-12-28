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
