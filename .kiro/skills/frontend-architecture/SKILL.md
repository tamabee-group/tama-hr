---
name: Frontend Architecture
description: Next.js 16.1 App Router architecture, project structure, layouts, Glass UI design system, component placement rules
---

# Frontend Architecture (Next.js 16.1 App Router)

## Proxy (Next.js 16.1)

- Next.js 16.1 dùng `src/proxy.ts` thay vì `middleware.ts`
- KHÔNG tạo file `middleware.ts`
- Proxy xử lý: API forwarding, authentication, i18n routing
- Export: `export default function proxy()` và `export const config`

## Header Pattern

### Desktop Header

- Tất cả các trang đều hiển thị title trong header với font size lớn (`text-lg font-semibold`)
- Title được cấu hình trong `HeaderConfig.mainPages` (trang chính) và `HeaderConfig.subPageTitles` (trang con)
- KHÔNG có nút toggle theme trong header

### Page Title

- KHÔNG đặt title/description trong page content
- Title được hiển thị trong header của layout
- Sử dụng `useHeaderInfo()` hook để lấy title từ config

### BackButton Component

- Import từ `@/app/[locale]/_components/_base/_back-button`
- Sử dụng `router.back()` để quay lại trang trước
- Đặt ở đầu page content cho các trang con (level 2+)

```tsx
import { BackButton } from "@/app/[locale]/_components/_base/_back-button";

export function MyPageContent() {
  return (
    <div className="space-y-4">
      <BackButton />
      {/* Nội dung page */}
    </div>
  );
}
```

## Project Structure

```
src/
├── proxy.ts                    # Proxy (thay middleware.ts)
├── app/[locale]/
│   ├── (HomeLayout)/           # Public pages (landing, pricing)
│   ├── (NotFooter)/            # Auth pages (login, register)
│   ├── (TamabeeLayout)/        # Platform management (Tamabee admin only)
│   │   └── admin/
│   │       ├── companies/      # Quản lý công ty khách hàng
│   │       ├── deposits/       # Quản lý nạp tiền
│   │       ├── feedbacks/      # Quản lý feedback từ users
│   │       ├── plans/          # Quản lý gói dịch vụ
│   │       ├── settings/       # Cấu hình platform
│   │       └── system-notifications/ # Thông báo hệ thống
│   ├── (PersonalLayout)/       # Personal workspace (all authenticated users)
│   │   └── me/
│   │       ├── adjustments/    # Lịch sử điều chỉnh
│   │       ├── commissions/    # Hoa hồng (Tamabee employees)
│   │       ├── help/           # Trung tâm hỗ trợ + Feedback
│   │       ├── leave/          # Nghỉ phép
│   │       ├── notifications/  # Chi tiết thông báo
│   │       └── schedule/       # Lịch làm việc
│   ├── (DashboardLayout)/      # HR Management (Admin/Manager only)
│   │   └── dashboard/
│   │       ├── attendance/     # Quản lý chấm công
│   │       ├── payroll/        # Quản lý lương
│   │       ├── employees/      # Quản lý nhân viên
│   │       ├── settings/       # Cấu hình công ty
│   │       └── ...
│   └── _components/            # Shared components
│       └── _base/              # BaseTable, BaseSidebar
├── components/ui/              # Shadcn/ui
├── lib/
│   ├── apis/                   # API functions
│   ├── auth/                   # Auth utilities
│   └── utils/                  # Utilities (format-date, format-currency, get-error-message)
├── types/                      # TypeScript types
├── hooks/                      # Custom hooks
├── constants/                  # Constants
└── messages/                   # i18n (vi.json, en.json, ja.json)
```

## Layout Access

| Layout          | Path                             | Roles                                |
| --------------- | -------------------------------- | ------------------------------------ |
| HomeLayout      | `/(HomeLayout)`                  | Public                               |
| NotFooter       | `/(NotFooter)`                   | Public (auth)                        |
| TamabeeLayout   | `/(TamabeeLayout)/admin/*`       | ADMIN_TAMABEE, MANAGER_TAMABEE       |
| PersonalLayout  | `/(PersonalLayout)/me/*`         | All authenticated users              |
| DashboardLayout | `/(DashboardLayout)/dashboard/*` | ADMIN*\*, MANAGER*\* (HR Management) |

## Component Placement

1. **Default**: Component trong folder của page sử dụng nó
2. **Share**: Move lên cấp cha khi 2+ pages cùng cấp cần dùng
3. **Tránh premature abstraction**
4. **Glass UI Components**: Các component UI glass dùng chung đặt tại `_components/_glass-style/` để toàn app sử dụng

## File Naming

| Type               | Pattern             | Example               |
| ------------------ | ------------------- | --------------------- |
| Page               | `page.tsx`          | `page.tsx`            |
| Internal component | `_kebab-case.tsx`   | `_deposit-table.tsx`  |
| Shared component   | `kebab-case.tsx`    | `base-table.tsx`      |
| Hook               | `use-kebab-case.ts` | `use-auth.ts`         |
| Utility            | `kebab-case.ts`     | `format-date-time.ts` |

## Server vs Client Components

- Pages (`page.tsx`) PHẢI là Server Components
- `'use client'` chỉ khi cần: useState, useEffect, event handlers
- Tách interactive logic thành internal component

## Glass Style Design System

App sử dụng iOS Liquid Glass design cho UI components. Các glass components được đặt tại `_components/_glass-style/`:

| Component      | Mô tả                       | Thay thế cho       |
| -------------- | --------------------------- | ------------------ |
| `GlassSection` | Container cho form sections | Card               |
| `GlassCard`    | Card với glass effect       | Card               |
| `GlassNav`     | Navigation sidebar          | Card + Button list |
| `GlassTable`   | Table với glass effect      | Table              |
| `GlassTabs`    | Tab navigation              | Tabs               |

```tsx
import {
  GlassSection,
  GlassNav,
  GlassCard,
} from "@/app/[locale]/_components/_glass-style";
```

### Quy tắc

- **ƯU TIÊN** sử dụng Glass components thay vì Card/Tabs từ shadcn/ui cho các trang settings, forms
- Khi tạo component UI glass mới, đặt trong `_components/_glass-style/` và export từ `index.ts`
- Glass components sử dụng `backdrop-blur-xl`, `bg-white/70` (light) và `dark:bg-white/10` (dark)
