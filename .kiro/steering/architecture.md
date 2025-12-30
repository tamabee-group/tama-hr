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

### Nguyên tắc đặt component (Component Placement)

**Ưu tiên đặt component ở cấp con (leaf level):**

1. **Mặc định**: Đặt component ngay trong folder của page sử dụng nó
2. **Khi cần share**: Chỉ move lên cấp cha gần nhất khi có 2+ pages cùng cấp cần dùng
3. **Tránh premature abstraction**: KHÔNG đặt component ở cấp cao hơn cần thiết

```
# ✅ ĐÚNG: Component ở cấp con
app/[locale]/(tamabee-admin)/companies/
├── page.tsx
├── _company-table.tsx      # Chỉ page này dùng
└── _company-dialog.tsx

# ✅ ĐÚNG: Move lên khi 2+ pages cùng layout cần dùng
app/[locale]/(tamabee-admin)/
├── _components/
│   └── _stats-card.tsx     # companies/ và dashboard/ đều dùng
├── companies/
│   └── page.tsx
└── dashboard/
    └── page.tsx

# ❌ SAI: Đặt ở cấp cao không cần thiết
app/[locale]/_components/
└── _company-table.tsx      # Chỉ 1 page dùng, không nên ở đây
```

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

### Page Components

- Pages (`page.tsx`) PHẢI là Server Components - KHÔNG dùng `'use client'`
- Fetch data ở page level, truyền xuống Client Components
- Nếu cần interactivity (useState, useEffect, event handlers), tách thành internal component với `'use client'`

```tsx
// ✅ ĐÚNG: Page là Server Component
// app/[locale]/(admin)/users/page.tsx
export default async function UsersPage() {
  const users = await getUsers(); // Server-side fetch
  return <UserTable data={users} />; // Client component nhận data
}

// ❌ SAI: Page là Client Component
("use client");
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetchUsers();
  }, []);
  // ...
}
```

### Client Components

- Chỉ dùng `'use client'` khi cần: useState, useEffect, event handlers, browser APIs
- Đặt `'use client'` ở đầu file
- Tách thành internal component (`_component-name.tsx`)

```tsx
// _user-table.tsx
"use client";
export function UserTable({ data }: { data: User[] }) {
  const [selected, setSelected] = useState<User | null>(null);
  // Interactive logic here
}
```

## File Naming

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Loading: `loading.tsx`
- Error: `error.tsx`
- Components: `kebab-case.tsx`
