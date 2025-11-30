# Performance & UX Best Practices

## Performance Optimization

### Server Components First
```tsx
// ✅ GOOD - Server Component (default)
// app/[locale]/(tamabee-admin)/companies/page.tsx
import { getCompanies } from '@/lib/api/companies'
import { CompanyTable } from '@/components/tamabee-admin/_company-table'

export default async function CompaniesPage() {
  const companies = await getCompanies()
  
  return <CompanyTable data={companies} />
}

// ❌ BAD - Unnecessary Client Component
'use client'
import { useEffect, useState } from 'react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([])
  
  useEffect(() => {
    fetch('/api/companies').then(/* ... */)
  }, [])
  
  return <CompanyTable data={companies} />
}
```

### Image Optimization
```tsx
import Image from 'next/image'

// ✅ GOOD - Optimized with next/image
export function CompanyLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={200}
      height={200}
      className="rounded-lg"
      priority={false}
      loading="lazy"
    />
  )
}

// ❌ BAD - Regular img tag
export function CompanyLogo({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} className="w-[200px] h-[200px]" />
}
```

### Dynamic Imports
```tsx
// ✅ GOOD - Lazy load heavy components
import dynamic from 'next/dynamic'

const ChartComponent = dynamic(() => import('@/components/_shared/chart'), {
  loading: () => <SkeletonChart />,
  ssr: false,
})

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ChartComponent data={data} />
    </div>
  )
}
```

### Suspense Boundaries
```tsx
import { Suspense } from 'react'
import { SkeletonTable } from '@/components/_shared/loading/skeleton-table'

export default function CompaniesPage() {
  return (
    <div>
      <h1>Companies</h1>
      <Suspense fallback={<SkeletonTable />}>
        <CompanyList />
      </Suspense>
    </div>
  )
}

async function CompanyList() {
  const companies = await getCompanies()
  return <CompanyTable data={companies} />
}
```

### Caching Strategy
```typescript
// lib/api/fetch-server.ts
export async function fetchServer<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    next: {
      revalidate: 60, // Cache for 60 seconds
      tags: ['companies'], // For on-demand revalidation
    },
  })
  
  return response.json()
}

// Revalidate on-demand
import { revalidateTag } from 'next/cache'

export async function createCompany(data: CompanyRequest) {
  const result = await fetchClient('/api/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  revalidateTag('companies') // Revalidate cache
  return result
}
```

## Loading States

### Skeleton Loaders
```tsx
// components/_shared/loading/skeleton-table.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
```

```tsx
// components/_shared/loading/skeleton-card.tsx
export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}
```

### Loading Page
```tsx
// app/[locale]/(tamabee-admin)/companies/loading.tsx
import { SkeletonTable } from '@/components/_shared/loading/skeleton-table'

export default function Loading() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <SkeletonTable rows={10} columns={5} />
    </div>
  )
}
```

### Inline Loading
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export function SubmitButton() {
  const [loading, setLoading] = useState(false)
  
  return (
    <Button disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? 'Submitting...' : 'Submit'}
    </Button>
  )
}
```

## UX Enhancements

### Toast Notifications
```tsx
// lib/hooks/use-toast.ts
import { toast } from 'sonner'

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string
        error: string
      }
    ) => toast.promise(promise, messages),
  }
}

// Usage
'use client'

import { useToast } from '@/lib/hooks/use-toast'

export function CreateCompanyButton() {
  const { promise } = useToast()
  
  const handleCreate = async () => {
    await promise(createCompany(data), {
      loading: 'Creating company...',
      success: 'Company created successfully',
      error: 'Failed to create company',
    })
  }
  
  return <Button onClick={handleCreate}>Create</Button>
}
```

### Optimistic Updates
```tsx
'use client'

import { useOptimistic } from 'react'

export function CompanyList({ companies }: { companies: Company[] }) {
  const [optimisticCompanies, addOptimisticCompany] = useOptimistic(
    companies,
    (state, newCompany: Company) => [...state, newCompany]
  )
  
  const handleCreate = async (data: CompanyRequest) => {
    const tempCompany = { ...data, id: Date.now() } as Company
    addOptimisticCompany(tempCompany)
    
    await createCompany(data)
  }
  
  return (
    <div>
      {optimisticCompanies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  )
}
```

### Debounced Search
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/lib/hooks/use-debounce'

export function SearchInput({ onSearch }: { onSearch: (value: string) => void }) {
  const [value, setValue] = useState('')
  const debouncedValue = useDebounce(value, 500)
  
  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])
  
  return (
    <Input
      placeholder="Search..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

// lib/hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}
```

### Confirmation Dialogs
```tsx
// components/_shared/dialog/confirm-dialog.tsx
'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
  confirmText?: string
  cancelText?: string
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)
  
  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Empty States
```tsx
// components/_shared/empty-state.tsx
import { FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}
```

## Performance Checklist

- [ ] Use Server Components by default
- [ ] Lazy load heavy components
- [ ] Optimize images with next/image
- [ ] Implement proper caching strategy
- [ ] Add Suspense boundaries
- [ ] Show skeleton loaders
- [ ] Debounce search inputs
- [ ] Use optimistic updates
- [ ] Minimize client-side JavaScript
- [ ] Implement proper error boundaries

## UX Checklist

- [ ] Show loading states for all async operations
- [ ] Provide feedback with toast notifications
- [ ] Confirm destructive actions
- [ ] Show empty states
- [ ] Handle errors gracefully
- [ ] Support keyboard navigation
- [ ] Ensure mobile responsiveness
- [ ] Test dark/light themes
- [ ] Add proper ARIA labels
- [ ] Optimize for accessibility
