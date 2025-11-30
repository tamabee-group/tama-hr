# API Integration Rules

## API Client Setup

### Fetch Client (Client-Side)
```typescript
// lib/api/fetch-client.ts
import { cookies } from 'next/headers'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>
}

export async function fetchClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  
  // Build URL with params
  const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  
  // Get token from cookie (client-side)
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1]
  
  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }
  
  return response.json()
}
```

### Fetch Server (Server-Side)
```typescript
// lib/api/fetch-server.ts
import { cookies } from 'next/headers'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>
}

export async function fetchServer<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  
  // Build URL with params
  const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
  }
  
  // Get token from cookie (server-side)
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
    next: { revalidate: 0 }, // Disable cache by default
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }
  
  return response.json()
}
```

## API Functions Organization

### Auth API
```typescript
// lib/api/auth.ts
import { fetchClient } from './fetch-client'
import { fetchServer } from './fetch-server'
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/api'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return fetchClient<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function register(data: RegisterRequest): Promise<void> {
  return fetchClient<void>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getCurrentUser(): Promise<User> {
  return fetchServer<User>('/api/auth/me')
}

export async function logout(): Promise<void> {
  return fetchClient<void>('/api/auth/logout', {
    method: 'POST',
  })
}
```

### Companies API
```typescript
// lib/api/companies.ts
import { fetchServer } from './fetch-server'
import { fetchClient } from './fetch-client'
import type { Company, CompanyRequest, PaginatedResponse } from '@/types/api'

export async function getCompanies(params?: {
  page?: number
  size?: number
  search?: string
}): Promise<PaginatedResponse<Company>> {
  return fetchServer<PaginatedResponse<Company>>('/api/admin/companies', { params })
}

export async function getCompanyById(id: number): Promise<Company> {
  return fetchServer<Company>(`/api/admin/companies/${id}`)
}

export async function createCompany(data: CompanyRequest): Promise<Company> {
  return fetchClient<Company>('/api/admin/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCompany(id: number, data: CompanyRequest): Promise<Company> {
  return fetchClient<Company>(`/api/admin/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCompany(id: number): Promise<void> {
  return fetchClient<void>(`/api/admin/companies/${id}`, {
    method: 'DELETE',
  })
}
```

### Employees API
```typescript
// lib/api/employees.ts
import { fetchServer } from './fetch-server'
import { fetchClient } from './fetch-client'
import type { User, UserRequest, PaginatedResponse } from '@/types/api'

export async function getEmployees(params?: {
  page?: number
  size?: number
  search?: string
  role?: string
}): Promise<PaginatedResponse<User>> {
  return fetchServer<PaginatedResponse<User>>('/api/company/employees', { params })
}

export async function createEmployee(data: UserRequest): Promise<User> {
  return fetchClient<User>('/api/company/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

### Wallets API
```typescript
// lib/api/wallets.ts
import { fetchServer } from './fetch-server'
import { fetchClient } from './fetch-client'
import type { Wallet, WalletTransaction, DepositRequest } from '@/types/api'

export async function getWallet(): Promise<Wallet> {
  return fetchServer<Wallet>('/api/company/wallet')
}

export async function getTransactions(params?: {
  page?: number
  size?: number
}): Promise<PaginatedResponse<WalletTransaction>> {
  return fetchServer<PaginatedResponse<WalletTransaction>>('/api/company/wallet/transactions', { params })
}

export async function createDepositRequest(data: DepositRequest): Promise<void> {
  return fetchClient<void>('/api/company/deposits', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

## Cookie Management

### Set Auth Token (Server Action)
```typescript
// lib/actions/auth.ts
'use server'

import { cookies } from 'next/headers'

export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
}

export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}
```

## Error Handling

### API Error Types
```typescript
// types/api.ts
export interface ApiError {
  success: false
  message: string
  errorCode: string
  timestamp: string
}

export interface ApiSuccess<T> {
  success: true
  message: string
  data: T
  timestamp: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
```

### Error Handler
```typescript
// lib/utils/error-handler.ts
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
```

## Best Practices

1. **Use fetchServer for Server Components**
   - Automatic token from cookies
   - Better performance
   - SEO friendly

2. **Use fetchClient for Client Components**
   - User interactions
   - Form submissions
   - Real-time updates

3. **Type Safety**
   - Define all API types in types/api.ts
   - Use generics for reusable functions
   - No 'any' types

4. **Error Handling**
   - Always wrap API calls in try-catch
   - Show user-friendly error messages
   - Log errors for debugging

5. **Loading States**
   - Use Suspense for Server Components
   - Use loading states for Client Components
   - Show skeleton loaders
