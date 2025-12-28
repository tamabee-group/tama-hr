# Frontend Architecture (Next.js 16 App Router)

## Project Structure

```
src/
├── app/[locale]/
│   ├── (landing)/          # Public marketing pages
│   ├── (auth)/             # Login, register, verify
│   ├── (tamabee-admin)/    # Tamabee admin layout
│   ├── (company-admin)/    # Company admin layout
│   └── (employee)/         # Employee layout
├── components/
│   ├── _shared/            # Shared across all layouts
│   ├── ui/                 # Shadcn/ui components
│   └── [layout]/           # Layout-specific components
├── lib/
│   ├── apis/               # API client functions
│   ├── auth/               # Auth utilities
│   └── utils/              # Utility functions
├── types/                  # TypeScript types
├── hooks/                  # Custom React hooks
└── messages/               # i18n translations (vi, en, ja)
```

## Layout Organization

| Layout        | Path               | Access                         |
| ------------- | ------------------ | ------------------------------ |
| Landing       | `/(landing)`       | Public                         |
| Auth          | `/(auth)`          | Public                         |
| Tamabee Admin | `/(tamabee-admin)` | ADMIN_TAMABEE, MANAGER_TAMABEE |
| Company Admin | `/(company-admin)` | ADMIN_COMPANY, MANAGER_COMPANY |
| Employee      | `/(employee)`      | EMPLOYEE_COMPANY               |

## Component Conventions

- Internal components: prefix với `_` (e.g., `_company-table.tsx`)
- Shared components: đặt trong `components/_shared/`
- Max 200 lines per component
- Extract sub-components khi cần

## Component Reusability

### Khi nào tách component

- Component được dùng ở **2+ màn hình** → chuyển vào `components/_shared/`
- Component chỉ dùng trong 1 layout → giữ trong `app/[locale]/(layout)/_components/`
- Component chỉ dùng trong 1 page → đặt cùng folder với page, prefix `_`

### Cấu trúc components

```
components/
├── _shared/                    # Dùng chung toàn app
│   ├── _base/                  # Base components (BaseTable, BaseDialog, BaseSidebar)
│   ├── _form/                  # Form components (FormInput, FormSelect, FormDatePicker)
│   └── _layout/                # Layout components (Header, Footer, Breadcrumb)
└── ui/                         # Shadcn/ui components

app/[locale]/
├── _components/                # Shared trong locale
│   └── _base/                  # BaseTable, BaseSidebar...
├── (tamabee-admin)/
│   └── _components/            # Shared trong tamabee-admin layout
│       ├── _sidebar-nav.tsx
│       └── _header.tsx
└── (company-admin)/
    └── companies/
        ├── page.tsx
        ├── _company-table.tsx  # Chỉ dùng trong page này
        └── _company-dialog.tsx
```

## File Naming Conventions

### Quy tắc chung

| Loại               | Pattern             | Ví dụ                |
| ------------------ | ------------------- | -------------------- |
| Page               | `page.tsx`          | `page.tsx`           |
| Layout             | `layout.tsx`        | `layout.tsx`         |
| Loading            | `loading.tsx`       | `loading.tsx`        |
| Error              | `error.tsx`         | `error.tsx`          |
| Internal component | `_kebab-case.tsx`   | `_company-table.tsx` |
| Shared component   | `kebab-case.tsx`    | `base-table.tsx`     |
| Hook               | `use-kebab-case.ts` | `use-auth.ts`        |
| Utility            | `kebab-case.ts`     | `format-date.ts`     |
| Type               | `kebab-case.ts`     | `user.ts`            |
| API function       | `kebab-case.ts`     | `company-api.ts`     |

### Component naming

```
# Internal (chỉ dùng trong folder hiện tại)
_company-table.tsx
_user-dialog.tsx
_filter-form.tsx

# Shared (dùng nhiều nơi)
base-table.tsx
base-dialog.tsx
base-sidebar.tsx

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

```tsx
// Server Component (default) - fetch data
export default async function Page() {
  const data = await getData();
  return <ClientComponent data={data} />;
}

// Client Component - interactivity
("use client");
export function ClientComponent({ data }) {
  const [state, setState] = useState();
  // ...
}
```

## File Naming

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Loading: `loading.tsx`
- Error: `error.tsx`
- Components: `kebab-case.tsx`
