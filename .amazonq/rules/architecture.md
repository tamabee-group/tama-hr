# Frontend Architecture Rules

## Project Structure
Next.js 16 App Router with TypeScript, organized by feature and role-based layouts.

```
src/
├── app/                                # App Router (Next.js 16)
│   ├── [locale]/                       # i18n routing (vi, en, ja)
│   │   ├── (landing)/                  # Landing page layout
│   │   │   ├── page.tsx
│   │   │   ├── about/
│   │   │   └── pricing/
│   │   ├── (auth)/                     # Auth pages (login, register)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── verify/
│   │   ├── (tamabee-admin)/            # Tamabee admin layout
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── companies/
│   │   │   ├── deposits/
│   │   │   ├── plans/
│   │   │   └── wallets/
│   │   ├── (company-admin)/            # Company admin layout
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── profile/
│   │   │   └── wallet/
│   │   └── (employee)/                 # Employee layout
│   │       ├── layout.tsx
│   │       └── dashboard/
│   └── api/                            # API routes (if needed)
├── components/                         # Reusable components
│   ├── _shared/                        # Shared across all layouts
│   │   ├── header/
│   │   ├── footer/
│   │   ├── sidebar/
│   │   ├── data-table/
│   │   ├── dialog/
│   │   ├── form/
│   │   └── loading/
│   ├── landing/                        # Landing page components
│   ├── tamabee-admin/                  # Tamabee admin components
│   └── company-admin/                  # Company admin components
├── lib/                                # Utilities and configurations
│   ├── api/                            # API client functions
│   │   ├── fetch-client.ts
│   │   ├── fetch-server.ts
│   │   ├── auth.ts
│   │   ├── companies.ts
│   │   ├── employees.ts
│   │   └── wallets.ts
│   ├── utils/                          # Utility functions
│   │   ├── cn.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── date.ts
│   ├── hooks/                          # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-theme.ts
│   │   └── use-locale.ts
│   └── constants/                      # Constants
│       ├── colors.ts
│       └── routes.ts
├── types/                              # TypeScript types
│   ├── api.ts
│   ├── user.ts
│   ├── company.ts
│   └── wallet.ts
├── messages/                           # i18n translations
│   ├── vi.json
│   ├── en.json
│   └── ja.json
└── styles/
    └── globals.css
```

## Key Principles

### 1. Server-First Approach
- Pages are Server Components by default
- Use 'use client' only when necessary (interactivity, hooks)
- Fetch data in Server Components
- Pass data as props to Client Components

### 2. Component Reusability
- Create small, focused components in _shared/
- Prefix internal components with underscore (_component)
- Share common components (Sidebar, DataTable, Dialog)
- Avoid duplication across layouts

### 3. Layout Organization
- **Landing**: Public marketing pages
- **Tamabee Admin**: Full system management
- **Company Admin**: Company self-management
- **Employee**: Limited employee access
- Each layout has its own sidebar and navigation

### 4. Type Safety
- NO 'any' type - always define specific types
- Create types in types/ directory
- Use TypeScript strict mode
- Define API response types

### 5. Performance
- Use Suspense and loading.tsx
- Implement skeleton loaders
- Optimize images with next/image
- Lazy load heavy components
- Cache API responses

## File Naming Conventions
- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Loading: `loading.tsx`
- Error: `error.tsx`
- Components: `kebab-case.tsx` (e.g., `data-table.tsx`)
- Internal components: `_component-name.tsx`
- Types: `kebab-case.ts`
- Utils: `kebab-case.ts`
