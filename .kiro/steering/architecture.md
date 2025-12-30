# Frontend Architecture (Next.js 16 App Router)

## Project Structure

```
src/
├── app/[locale]/
│   ├── (HomeLayout)/       # Public marketing pages (landing, about)
│   ├── (NotFooter)/        # Auth pages (login, register, forgot-password)
│   ├── (AdminLayout)/
│   │   ├── tamabee/        # Tamabee admin pages
│   │   ├── company/        # Company admin pages
│   │   └── employee/       # Employee pages
│   └── _components/        # Shared components trong locale
│       └── _base/          # Base components (BaseTable, BaseSidebar)
├── components/
│   └── ui/                 # Shadcn/ui components
├── lib/
│   ├── apis/               # API client functions
│   ├── auth/               # Auth utilities
│   └── utils/              # Utility functions
│       ├── format-date.ts      # Date formatting (locale-aware)
│       ├── format-currency.ts  # Currency formatting
│       ├── get-error-message.ts # Error translation utility
│       └── get-enum-label.ts   # Enum translation utility
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
└── messages/               # i18n translations
    ├── vi.json             # Vietnamese
    ├── en.json             # English (fallback)
    └── ja.json             # Japanese
```

## Layout Organization

| Layout      | Path                      | Access                         |
| ----------- | ------------------------- | ------------------------------ |
| HomeLayout  | `/(HomeLayout)`           | Public                         |
| NotFooter   | `/(NotFooter)`            | Public (auth pages)            |
| AdminLayout | `/(AdminLayout)/tamabee`  | ADMIN_TAMABEE, MANAGER_TAMABEE |
| AdminLayout | `/(AdminLayout)/company`  | ADMIN_COMPANY, MANAGER_COMPANY |
| AdminLayout | `/(AdminLayout)/employee` | EMPLOYEE_COMPANY               |

## Component Conventions

- Internal components: prefix với `_` (e.g., `_company-table.tsx`)
- Shared components: đặt trong `app/[locale]/_components/`
- Max 250 lines per component
- Extract sub-components khi cần

## Component Reusability

### Nguyên tắc đặt component (Component Placement)

**Ưu tiên đặt component ở cấp con (leaf level):**

1. **Mặc định**: Đặt component ngay trong folder của page sử dụng nó
2. **Khi cần share**: Chỉ move lên cấp cha gần nhất khi có 2+ pages cùng cấp cần dùng
3. **Tránh premature abstraction**: KHÔNG đặt component ở cấp cao hơn cần thiết

```
# ✅ ĐÚNG: Component ở cấp con
app/[locale]/(AdminLayout)/tamabee/deposits/
├── page.tsx
├── _deposit-table.tsx      # Chỉ page này dùng
└── _deposit-dialog.tsx

# ✅ ĐÚNG: Move lên khi 2+ pages cùng layout cần dùng
app/[locale]/(AdminLayout)/tamabee/
├── _components/
│   └── _stats-card.tsx     # deposits/ và dashboard/ đều dùng
├── deposits/
│   └── page.tsx
└── dashboard/
    └── page.tsx

# ❌ SAI: Đặt ở cấp cao không cần thiết
app/[locale]/_components/
└── _deposit-table.tsx      # Chỉ 1 page dùng, không nên ở đây
```

### Khi nào tách component

- Component được dùng ở **2+ màn hình** → chuyển vào `app/[locale]/_components/`
- Component chỉ dùng trong 1 layout → giữ trong `app/[locale]/(layout)/_components/`
- Component chỉ dùng trong 1 page → đặt cùng folder với page, prefix `_`

### Cấu trúc components

```
app/[locale]/
├── _components/                # Shared trong locale
│   └── _base/                  # BaseTable, BaseSidebar, BaseCreateUserForm...
├── (AdminLayout)/
│   ├── tamabee/
│   │   ├── _components/        # Shared trong tamabee layout
│   │   │   └── _sidebar-nav.tsx
│   │   └── deposits/
│   │       ├── page.tsx
│   │       ├── _deposit-table.tsx  # Chỉ dùng trong page này
│   │       └── _deposit-dialog.tsx
│   └── company/
│       └── wallet/
│           ├── page.tsx
│           └── _wallet-table.tsx
└── (NotFooter)/
    └── register/
        ├── page.tsx
        ├── _step-1.tsx
        ├── _step-2.tsx
        ├── _step-3.tsx
        └── _step-4.tsx
```

## File Naming Conventions

### Quy tắc chung

| Loại               | Pattern             | Ví dụ                |
| ------------------ | ------------------- | -------------------- |
| Page               | `page.tsx`          | `page.tsx`           |
| Layout             | `layout.tsx`        | `layout.tsx`         |
| Loading            | `loading.tsx`       | `loading.tsx`        |
| Error              | `error.tsx`         | `error.tsx`          |
| Internal component | `_kebab-case.tsx`   | `_deposit-table.tsx` |
| Shared component   | `kebab-case.tsx`    | `base-table.tsx`     |
| Hook               | `use-kebab-case.ts` | `use-auth.ts`        |
| Utility            | `kebab-case.ts`     | `format-date.ts`     |
| Type               | `kebab-case.ts`     | `user.ts`            |
| API function       | `kebab-case.ts`     | `company-api.ts`     |

### Component naming

```
# Internal (chỉ dùng trong folder hiện tại)
_deposit-table.tsx
_user-dialog.tsx
_filter-form.tsx
_step-1.tsx

# Shared (dùng nhiều nơi)
base-table.tsx
base-dialog.tsx
base-sidebar.tsx
base-create-user-form.tsx

# UI (Shadcn)
button.tsx
input.tsx
dialog.tsx
```

### Folder naming

- Dùng `kebab-case` cho tất cả folders
- Route groups dùng `(group-name)`
- Private folders dùng `_folder-name`

## Server vs Client Components

### Page Components

- Pages (`page.tsx`) PHẢI là Server Components - KHÔNG dùng `'use client'`
- Fetch data ở page level, truyền xuống Client Components
- Nếu cần interactivity (useState, useEffect, event handlers), tách thành internal component với `'use client'`

```tsx
// ✅ ĐÚNG: Page là Server Component
// app/[locale]/(AdminLayout)/tamabee/deposits/page.tsx
import { getTranslations } from "next-intl/server";

export default async function DepositsPage() {
  const t = await getTranslations("deposits");
  return (
    <div>
      <h1>{t("title")}</h1>
      <DepositTable /> {/* Client component */}
    </div>
  );
}

// ❌ SAI: Page là Client Component
("use client");
export default function DepositsPage() {
  const [deposits, setDeposits] = useState([]);
  // ...
}
```

### Client Components

- Chỉ dùng `'use client'` khi cần: useState, useEffect, event handlers, browser APIs
- Đặt `'use client'` ở đầu file
- Tách thành internal component (`_component-name.tsx`)

```tsx
// _deposit-table.tsx
"use client";
import { useTranslations } from "next-intl";

export function DepositTable() {
  const t = useTranslations("deposits");
  const tEnums = useTranslations("enums");
  const [selected, setSelected] = useState<Deposit | null>(null);
  // Interactive logic here
}
```

## i18n Architecture

### Message File Structure

```
messages/
├── vi.json     # Vietnamese translations
├── en.json     # English translations (fallback)
└── ja.json     # Japanese translations
```

### Namespaces

| Namespace     | Mô tả                                |
| ------------- | ------------------------------------ |
| `common`      | Shared UI elements (buttons, labels) |
| `auth`        | Authentication (login, register)     |
| `header`      | Header navigation                    |
| `deposits`    | Deposit management                   |
| `plans`       | Plan management                      |
| `companies`   | Company management                   |
| `wallet`      | Wallet & transactions                |
| `users`       | User management                      |
| `settings`    | Settings pages                       |
| `enums`       | Enum translations                    |
| `errors`      | Error messages                       |
| `validation`  | Form validation messages             |
| `dialogs`     | Dialog content                       |
| `commissions` | Commission management                |

### Translation Flow

```
User Request → Middleware (detect locale) → next-intl → Component
                                                ↓
                                        messages/{locale}.json
```

## File Naming

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Loading: `loading.tsx`
- Error: `error.tsx`
- Components: `kebab-case.tsx`
