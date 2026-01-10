# Frontend Architecture (Next.js 16.1 App Router)

## Proxy (Next.js 16.1)

- Next.js 16.1 dùng `src/proxy.ts` thay vì `middleware.ts`
- KHÔNG tạo file `middleware.ts`
- Proxy xử lý: API forwarding, authentication, i18n routing
- Export: `export default function proxy()` và `export const config`

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
│   │       ├── plans/          # Quản lý gói dịch vụ
│   │       └── settings/       # Cấu hình platform
│   ├── (DashboardLayout)/      # HR features (tất cả users kể cả Tamabee)
│   │   └── dashboard/
│   │       ├── attendance/     # Chấm công
│   │       ├── payroll/        # Bảng lương
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

| Layout          | Path                             | Roles                                   |
| --------------- | -------------------------------- | --------------------------------------- |
| HomeLayout      | `/(HomeLayout)`                  | Public                                  |
| NotFooter       | `/(NotFooter)`                   | Public (auth)                           |
| TamabeeLayout   | `/(TamabeeLayout)/admin/*`       | ADMIN_TAMABEE, MANAGER_TAMABEE          |
| DashboardLayout | `/(DashboardLayout)/dashboard/*` | All authenticated users (kể cả Tamabee) |

## Component Placement

1. **Default**: Component trong folder của page sử dụng nó
2. **Share**: Move lên cấp cha khi 2+ pages cùng cấp cần dùng
3. **Tránh premature abstraction**

```
# Component chỉ 1 page dùng
app/[locale]/(TamabeeLayout)/admin/deposits/
├── page.tsx
├── _deposit-table.tsx
└── _deposit-dialog.tsx

# Component share trong layout
app/[locale]/(DashboardLayout)/da

## File Naming

| Type               | Pattern             | Example              |
| ------------------ | ------------------- | -------------------- |
| Page               | `page.tsx`          | `page.tsx`           |
| Internal component | `_kebab-case.tsx`   | `_deposit-table.tsx` |
| Shared component   | `kebab-case.tsx`    | `base-table.tsx`     |
| Hook               | `use-kebab-case.ts` | `use-auth.ts`        |
| Utility            | `kebab-case.ts`     | `format-date.ts`     |

## Server vs Client Components

- Pages (`page.tsx`) PHẢI là Server Components
- `'use client'` chỉ khi cần: useState, useEffect, event handlers
- Tách interactive logic thành internal component
```
