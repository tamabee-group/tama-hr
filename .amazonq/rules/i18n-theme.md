# Internationalization & Theme

## i18n with next-intl

### Configuration
```typescript
// i18n.ts
import { getRequestConfig } from 'next-intl/server'

export const locales = ['vi', 'en', 'ja'] as const
export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}))
```

### Middleware
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale: 'vi',
  localePrefix: 'always',
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

### Translation Files
```json
// messages/vi.json
{
  "common": {
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "edit": "Sửa",
    "search": "Tìm kiếm",
    "loading": "Đang tải..."
  },
  "auth": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "email": "Email",
    "password": "Mật khẩu",
    "employeeCode": "Mã nhân viên"
  },
  "company": {
    "name": "Tên công ty",
    "employees": "Nhân viên",
    "wallet": "Ví tiền",
    "balance": "Số dư"
  }
}
```

```json
// messages/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "loading": "Loading..."
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "email": "Email",
    "password": "Password",
    "employeeCode": "Employee Code"
  },
  "company": {
    "name": "Company Name",
    "employees": "Employees",
    "wallet": "Wallet",
    "balance": "Balance"
  }
}
```

```json
// messages/ja.json
{
  "common": {
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除",
    "edit": "編集",
    "search": "検索",
    "loading": "読み込み中..."
  },
  "auth": {
    "login": "ログイン",
    "logout": "ログアウト",
    "email": "メール",
    "password": "パスワード",
    "employeeCode": "社員コード"
  },
  "company": {
    "name": "会社名",
    "employees": "従業員",
    "wallet": "ウォレット",
    "balance": "残高"
  }
}
```

### Usage in Components

#### Server Component
```tsx
// app/[locale]/(tamabee-admin)/companies/page.tsx
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'company' })
  
  return {
    title: t('name'),
  }
}

export default function CompaniesPage() {
  const t = useTranslations('company')
  
  return (
    <div>
      <h1>{t('name')}</h1>
    </div>
  )
}
```

#### Client Component
```tsx
'use client'

import { useTranslations } from 'next-intl'

export function CompanyDialog() {
  const t = useTranslations('common')
  
  return (
    <Dialog>
      <Button>{t('save')}</Button>
      <Button>{t('cancel')}</Button>
    </Dialog>
  )
}
```

### Language Switcher
```tsx
// components/_shared/language-switcher.tsx
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  
  const handleChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPathname)
  }
  
  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="vi">Tiếng Việt</SelectItem>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

## Dark/Light Theme

### Theme Provider
```tsx
// components/theme-provider.tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Root Layout
```tsx
// app/[locale]/layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children, params: { locale } }: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Theme Toggle
```tsx
// components/_shared/theme-toggle.tsx
'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## Color System

### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00b1ce',
          50: '#e6f7fb',
          100: '#cceff7',
          200: '#99dfef',
          300: '#66cfe7',
          400: '#33bfdf',
          500: '#00b1ce', // Main color
          600: '#008da5',
          700: '#006a7c',
          800: '#004752',
          900: '#002329',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... other shadcn colors
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### CSS Variables
```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 189 100% 40%; /* #00b1ce */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... other variables */
  }

  .dark {
    --primary: 189 100% 40%; /* Same primary color */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... other variables */
  }
}
```

## Best Practices

1. **Translation Keys**
   - Use nested structure (namespace.key)
   - Keep keys descriptive
   - Avoid hardcoded strings

2. **Theme Consistency**
   - Use CSS variables for colors
   - Test both light and dark modes
   - Use primary color (#00b1ce) consistently

3. **Accessibility**
   - Provide language labels
   - Ensure color contrast
   - Support system preferences
