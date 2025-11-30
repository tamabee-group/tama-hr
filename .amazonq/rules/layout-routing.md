# Layout & Routing Rules

## Layout Structure

### Landing Layout
```tsx
// app/[locale]/(landing)/layout.tsx
import { Header } from '@/components/landing/_header'
import { Footer } from '@/components/landing/_footer'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

### Tamabee Admin Layout
```tsx
// app/[locale]/(tamabee-admin)/layout.tsx
import { Sidebar } from '@/components/_shared/sidebar/sidebar'
import { Header } from '@/components/_shared/header/header'
import { getTamabeeNavItems } from '@/lib/constants/nav-items'

export default async function TamabeeAdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = getTamabeeNavItems()
  
  return (
    <div className="flex h-screen">
      <Sidebar items={navItems} role="ADMIN_TAMABEE" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Company Admin Layout
```tsx
// app/[locale]/(company-admin)/layout.tsx
import { Sidebar } from '@/components/_shared/sidebar/sidebar'
import { Header } from '@/components/_shared/header/header'
import { getCompanyNavItems } from '@/lib/constants/nav-items'

export default async function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = getCompanyNavItems()
  
  return (
    <div className="flex h-screen">
      <Sidebar items={navItems} role="ADMIN_COMPANY" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Employee Layout
```tsx
// app/[locale]/(employee)/layout.tsx
import { Sidebar } from '@/components/_shared/sidebar/sidebar'
import { Header } from '@/components/_shared/header/header'
import { getEmployeeNavItems } from '@/lib/constants/nav-items'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const navItems = getEmployeeNavItems()
  
  return (
    <div className="flex h-screen">
      <Sidebar items={navItems} role="EMPLOYEE_COMPANY" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  )
}
```

## Navigation Items

### Nav Items Configuration
```typescript
// lib/constants/nav-items.ts
import { Building2, Users, Wallet, LayoutDashboard, Settings, FileText } from 'lucide-react'
import type { NavItem } from '@/types/nav'

export function getTamabeeNavItems(): NavItem[] {
  return [
    {
      title: 'Dashboard',
      href: '/tamabee-admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Companies',
      href: '/tamabee-admin/companies',
      icon: Building2,
    },
    {
      title: 'Deposits',
      href: '/tamabee-admin/deposits',
      icon: Wallet,
    },
    {
      title: 'Plans',
      href: '/tamabee-admin/plans',
      icon: FileText,
    },
    {
      title: 'Users',
      href: '/tamabee-admin/users',
      icon: Users,
    },
    {
      title: 'Settings',
      href: '/tamabee-admin/settings',
      icon: Settings,
    },
  ]
}

export function getCompanyNavItems(): NavItem[] {
  return [
    {
      title: 'Dashboard',
      href: '/company-admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Employees',
      href: '/company-admin/employees',
      icon: Users,
    },
    {
      title: 'Wallet',
      href: '/company-admin/wallet',
      icon: Wallet,
    },
    {
      title: 'Profile',
      href: '/company-admin/profile',
      icon: Building2,
    },
    {
      title: 'Settings',
      href: '/company-admin/settings',
      icon: Settings,
    },
  ]
}

export function getEmployeeNavItems(): NavItem[] {
  return [
    {
      title: 'Dashboard',
      href: '/employee/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Profile',
      href: '/employee/profile',
      icon: Users,
    },
    {
      title: 'Settings',
      href: '/employee/settings',
      icon: Settings,
    },
  ]
}
```

## Shared Layout Components

### Sidebar Component
```tsx
// components/_shared/sidebar/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { NavItem, UserRole } from '@/types'

interface SidebarProps {
  items: NavItem[]
  role: UserRole
}

export function Sidebar({ items, role }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-primary">Tamabee HR</h2>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
      
      <nav className="space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

### Header Component
```tsx
// components/_shared/header/header.tsx
import { ThemeToggle } from '@/components/_shared/theme-toggle'
import { LanguageSwitcher } from '@/components/_shared/language-switcher'
import { UserMenu } from './_user-menu'

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Breadcrumbs or page title */}
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
```

### User Menu
```tsx
// components/_shared/header/_user-menu.tsx
'use client'

import { LogOut, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logout } from '@/lib/api/auth'

export function UserMenu() {
  const router = useRouter()
  
  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src="/avatar.png" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

## Route Protection

### Middleware for Auth
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

const intlMiddleware = createMiddleware({
  locales: ['vi', 'en', 'ja'],
  defaultLocale: 'vi',
})

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl
  
  // Public routes
  const publicRoutes = ['/login', '/register', '/verify']
  const isPublicRoute = publicRoutes.some(route => pathname.includes(route))
  
  // Redirect to login if not authenticated
  if (!token && !isPublicRoute && !pathname.includes('/(landing)')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Apply i18n middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

## Loading & Error States

### Loading Page
```tsx
// app/[locale]/(tamabee-admin)/companies/loading.tsx
import { SkeletonTable } from '@/components/_shared/loading/skeleton-table'

export default function Loading() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      </div>
      <SkeletonTable rows={10} />
    </div>
  )
}
```

### Error Page
```tsx
// app/[locale]/(tamabee-admin)/companies/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
  
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

## Best Practices

1. **Layout Reusability**
   - Share Sidebar and Header across admin layouts
   - Use role-based navigation items
   - Keep layout logic minimal

2. **Route Organization**
   - Group routes by layout using (folder)
   - Use consistent naming
   - Separate public and protected routes

3. **Loading States**
   - Provide loading.tsx for each route
   - Use Suspense boundaries
   - Show skeleton loaders

4. **Error Handling**
   - Provide error.tsx for each route
   - Log errors appropriately
   - Offer retry functionality
