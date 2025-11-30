# Component Standards

## Component Types

### Server Components (Default)
```tsx
// app/[locale]/(tamabee-admin)/companies/page.tsx
import { getCompanies } from '@/lib/api/companies'
import { CompanyTable } from '@/components/tamabee-admin/_company-table'

export default async function CompaniesPage() {
  const companies = await getCompanies()
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Companies</h1>
      <CompanyTable data={companies} />
    </div>
  )
}
```

### Client Components (When Needed)
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CompanyDialog({ company }: { company: Company }) {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog content */}
    </Dialog>
  )
}
```

## Shared Components Structure

### DataTable Component
```tsx
// components/_shared/data-table/data-table.tsx
'use client'

import { Table } from '@/components/ui/table'
import { DataTablePagination } from './_pagination'
import { DataTableToolbar } from './_toolbar'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchKey?: string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ data, columns, searchKey, onRowClick }: DataTableProps<T>) {
  // Implementation
}
```

### Sidebar Component
```tsx
// components/_shared/sidebar/sidebar.tsx
'use client'

import { SidebarNav } from './_nav'
import { SidebarHeader } from './_header'
import { SidebarFooter } from './_footer'

interface SidebarProps {
  items: NavItem[]
  role: UserRole
}

export function Sidebar({ items, role }: SidebarProps) {
  return (
    <aside className="w-64 border-r bg-background">
      <SidebarHeader />
      <SidebarNav items={items} />
      <SidebarFooter />
    </aside>
  )
}
```

### Dialog Component
```tsx
// components/_shared/dialog/confirm-dialog.tsx
'use client'

import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: ConfirmDialogProps) {
  // Implementation
}
```

## Component Best Practices

### 1. Keep Components Small
- Single responsibility principle
- Max 200 lines per component
- Extract sub-components to _component files

### 2. Props Interface
```tsx
// Good - Explicit types
interface UserCardProps {
  user: User
  onEdit: (id: number) => void
  showActions?: boolean
}

// Bad - Using any
interface UserCardProps {
  user: any
  onEdit: any
}
```

### 3. Loading States
```tsx
// components/_shared/loading/skeleton-table.tsx
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
```

### 4. Error Handling
```tsx
// components/_shared/error/error-message.tsx
interface ErrorMessageProps {
  title?: string
  message: string
  retry?: () => void
}

export function ErrorMessage({ title, message, retry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive p-4">
      {title && <h3 className="font-semibold">{title}</h3>}
      <p className="text-sm text-muted-foreground">{message}</p>
      {retry && <Button onClick={retry}>Retry</Button>}
    </div>
  )
}
```

## Shadcn/ui Components

### Use Shadcn Components
- Button, Input, Select, Dialog, Table, etc.
- Customize in components/ui/
- Follow Shadcn conventions
- Use cn() utility for className merging

### Example Usage
```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { cn } from '@/lib/utils/cn'

export function MyComponent() {
  return (
    <div className={cn("flex gap-4", className)}>
      <Input placeholder="Search..." />
      <Button variant="default">Submit</Button>
    </div>
  )
}
```

## Component Organization

### Internal Components (_component)
```
components/tamabee-admin/
├── company-list.tsx          # Main component
├── _company-table.tsx        # Internal table
├── _company-dialog.tsx       # Internal dialog
└── _company-filters.tsx      # Internal filters
```

### Shared Components
```
components/_shared/
├── data-table/
│   ├── data-table.tsx
│   ├── _pagination.tsx
│   ├── _toolbar.tsx
│   └── _columns.tsx
├── sidebar/
│   ├── sidebar.tsx
│   ├── _nav.tsx
│   ├── _header.tsx
│   └── _footer.tsx
└── dialog/
    ├── confirm-dialog.tsx
    └── form-dialog.tsx
```

## Reusability Checklist
- [ ] Component is used in 2+ places → Move to _shared/
- [ ] Component is layout-specific → Keep in layout folder
- [ ] Component has sub-components → Prefix with underscore
- [ ] Component needs interactivity → Use 'use client'
- [ ] Component fetches data → Keep as Server Component
