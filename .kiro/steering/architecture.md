# Frontend Architecture (Next.js App Router)

## Project Structure

```
src/
├── app/[locale]/
│   ├── (HomeLayout)/       # Public pages (landing)
│   ├── (NotFooter)/        # Auth pages (login, register)
│   ├── (AdminLayout)/
│   │   ├── tamabee/        # Tamabee admin
│   │   ├── company/        # Company admin
│   │   └── employee/       # Employee pages
│   └── _components/        # Shared components
│       └── _base/          # BaseTable, BaseSidebar
├── components/ui/          # Shadcn/ui
├── lib/
│   ├── apis/               # API functions
│   ├── auth/               # Auth utilities
│   └── utils/              # Utilities (format-date, format-currency, get-error-message)
├── types/                  # TypeScript types
├── hooks/                  # Custom hooks
├── constants/              # Constants
└── messages/               # i18n (vi.json, en.json, ja.json)
```

## Layout Access

| Layout      | Path                      | Roles                          |
| ----------- | ------------------------- | ------------------------------ |
| HomeLayout  | `/(HomeLayout)`           | Public                         |
| NotFooter   | `/(NotFooter)`            | Public (auth)                  |
| AdminLayout | `/(AdminLayout)/tamabee`  | ADMIN_TAMABEE, MANAGER_TAMABEE |
| AdminLayout | `/(AdminLayout)/company`  | ADMIN_COMPANY, MANAGER_COMPANY |
| AdminLayout | `/(AdminLayout)/employee` | EMPLOYEE_COMPANY               |

## Component Placement

1. **Default**: Component trong folder của page sử dụng nó
2. **Share**: Move lên cấp cha khi 2+ pages cùng cấp cần dùng
3. **Tránh premature abstraction**

```
# Component chỉ 1 page dùng
app/[locale]/(AdminLayout)/tamabee/deposits/
├── page.tsx
├── _deposit-table.tsx
└── _deposit-dialog.tsx

# Component share trong layout
app/[locale]/(AdminLayout)/tamabee/
├── _components/
│   └── _stats-card.tsx
├── deposits/
└── dashboard/
```

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
