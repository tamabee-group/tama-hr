# Frontend Rules - Tama HR (Next.js 16.1 App Router)

## Architecture

### Project Structure

```
src/
├── proxy.ts                    # Proxy (thay middleware.ts)
├── app/[locale]/
│   ├── (HomeLayout)/           # Public pages
│   ├── (NotFooter)/            # Auth pages
│   ├── (TamabeeLayout)/admin/  # Platform management (ADMIN_TAMABEE, MANAGER_TAMABEE)
│   ├── (PersonalLayout)/me/    # Personal workspace (all authenticated)
│   ├── (DashboardLayout)/dashboard/  # HR Management (ADMIN*, MANAGER*)
│   └── _components/            # Shared components
├── components/ui/              # Shadcn/ui
├── lib/
│   ├── apis/                   # API functions
│   ├── auth/                   # Auth utilities
│   └── utils/                  # Utilities
├── types/                      # TypeScript types
├── hooks/                      # Custom hooks
├── constants/                  # Constants
└── messages/                   # i18n (vi.json, en.json, ja.json)
```

### Proxy

- Next.js 16.1 dùng `src/proxy.ts` thay vì `middleware.ts`
- KHÔNG tạo file `middleware.ts`

### Component Placement

1. **Default**: Component trong folder của page sử dụng nó
2. **Share**: Move lên cấp cha khi 2+ pages cùng cấp cần dùng
3. **Tránh premature abstraction**

### File Naming

| Type               | Pattern             | Example               |
| ------------------ | ------------------- | --------------------- |
| Page               | `page.tsx`          | `page.tsx`            |
| Internal component | `_kebab-case.tsx`   | `_deposit-table.tsx`  |
| Shared component   | `kebab-case.tsx`    | `base-table.tsx`      |
| Hook               | `use-kebab-case.ts` | `use-auth.ts`         |
| Utility            | `kebab-case.ts`     | `format-date-time.ts` |

### Server vs Client Components

- Pages (`page.tsx`) PHẢI là Server Components
- `'use client'` chỉ khi cần: useState, useEffect, event handlers
- Tách interactive logic thành internal component

## Coding Rules

### API & Navigation

- Client: `apiClient` từ `@/lib/utils/fetch-client`
- Server: `apiServer` từ `@/lib/utils/fetch-server`
- Navigation: `router.push()` hoặc `<Link>`, KHÔNG dùng `window.location.href`

### Components

- Max 250 lines/component, tách nhỏ khi cần
- `BaseTable` cho data tables, `BaseSidebar` cho navigation
- Shadcn/ui: `npx shadcn@latest add <component>` (KHÔNG dùng `-y`)

### Forms

- KHÔNG dùng `react-hook-form`, dùng `useState`
- Controlled components với `value` và `onChange`
- Error state: `useState<Record<string, string>>({})`

### i18n (next-intl)

- Locales: `vi`, `en`, `ja`
- **Max 3 levels**: `namespace.group.key`
- Client: `useTranslations("namespace")`
- Server: `await getTranslations("namespace")`
- KHÔNG hardcode text, KHÔNG inline labels pattern
- Enum translations: `getEnumLabel("enumName", value, tEnums)`
- Error translations: `getErrorMessage(errorCode, tErrors)`
- Khi update file translation: kiểm tra và xóa các key không còn sử dụng

### Formatting

- Date: `formatDate()`, `formatDateTime()` từ `@/lib/utils/format-date`
- Currency: `formatCurrency()` - JPY format `¥1,234`
- Duration: `formatMinutesToTime()` - vi/en: `HH:MM`, ja: `X時YY分`

### Tables

- Luôn dùng `BaseTable` component
- Luôn có cột STT đầu tiên: `page * pageSize + index + 1`
- Width cột STT: `w-[60px]`
- **KHÔNG dùng column Action** trong table
- Click vào row để hiển thị dialog chi tiết
- Đưa tất cả actions (Edit, Delete, Approve...) vào trong dialog chi tiết

### Statistics Cards

- KHÔNG dùng icons
- Màu value: green (positive), yellow (warning), blue (info), red (negative)
- Layout: `grid-cols-2 lg:grid-cols-4`

### Image Upload

- LUÔN compress sang WebP: `compressImageToWebP()`

## TypeScript Types

### Core Types

```typescript
interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  errorCode?: string;
}

interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

### Enums Pattern

```typescript
// types/enums.ts - chỉ chứa values
export const UserRole = {
  ADMIN_TAMABEE: "ADMIN_TAMABEE",
  MANAGER_TAMABEE: "MANAGER_TAMABEE",
  // ...
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// translations trong messages/*.json
```

### Rules

- KHÔNG dùng `any`, dùng `unknown` nếu cần
- Define types trong `types/` directory
- Dùng `getEnumLabel()` cho translated labels
- Prefer `interface` cho object shapes (error messages tốt hơn)
- Dùng const assertions cho literal types

## Clean Code Principles

### Function Rules

- Max 20 lines/function, ideally 5-10
- One function = one responsibility
- Max 3 arguments, prefer 0-2
- Guard clauses cho early returns

### Naming Rules

| Element   | Convention                                            |
| --------- | ----------------------------------------------------- |
| Variables | Reveal intent: `userCount` not `n`                    |
| Functions | Verb + noun: `getUserById()`                          |
| Booleans  | Question form: `isActive`, `hasPermission`, `canEdit` |
| Constants | SCREAMING_SNAKE: `MAX_RETRY_COUNT`                    |

### Anti-Patterns (KHÔNG làm)

| ❌ Don't                   | ✅ Do                   |
| -------------------------- | ----------------------- |
| `'use client'` everywhere  | Server by default       |
| Fetch in client components | Fetch in server         |
| Skip loading states        | Use loading.tsx         |
| Prop drilling deep         | Use context             |
| Giant components           | Split smaller           |
| Index as key               | Stable unique ID        |
| Comment every line         | Delete obvious comments |
| Deep nesting               | Guard clauses           |
| Magic numbers              | Named constants         |

### Before Editing ANY File

- Check: What imports this file? They might break
- Check: What does this file import? Interface changes
- Check: What tests cover this? Tests might fail
- **Edit the file + all dependent files in SAME task**

## React Patterns

### State Management

| Complexity     | Solution             |
| -------------- | -------------------- |
| Simple         | useState, useReducer |
| Shared local   | Context              |
| Server state   | React Query, SWR     |
| Complex global | Zustand              |

### Hook Rules

- Hooks at top level only
- Same order every render
- Custom hooks start with "use"
- Clean up effects on unmount

### Performance

- Profile first before optimizing
- Large lists → Virtualize
- Expensive calc → useMemo
- Stable callbacks → useCallback

## Error Handling

- Show fallback UI
- Log error
- Offer retry option
- Preserve user data

## Comments

- Viết bằng tiếng Việt
- KHÔNG comment "Requirements"
- Chạy `npx tsc --noEmit 2>&1` thay vì `npx next lint`
