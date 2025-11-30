# TypeScript Types & Standards

## Type Safety Rules

### NO 'any' Type
```typescript
// ❌ BAD - Never use 'any'
function processData(data: any) {
  return data.map((item: any) => item.name)
}

// ✅ GOOD - Use specific types
function processData(data: User[]) {
  return data.map((item) => item.name)
}
```

### Define All Types
```typescript
// types/api.ts
export interface BaseResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
  errorCode?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}
```

## Core Types

### User Types
```typescript
// types/user.ts
export enum UserRole {
  ADMIN_TAMABEE = 'ADMIN_TAMABEE',
  MANAGER_TAMABEE = 'MANAGER_TAMABEE',
  EMPLOYEE_TAMABEE = 'EMPLOYEE_TAMABEE',
  ADMIN_COMPANY = 'ADMIN_COMPANY',
  MANAGER_COMPANY = 'MANAGER_COMPANY',
  EMPLOYEE_COMPANY = 'EMPLOYEE_COMPANY',
}

export interface User {
  id: number
  employeeCode: string
  email: string
  name: string
  role: UserRole
  companyId: number
  referralCode?: string
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface UserRequest {
  email: string
  name: string
  role: UserRole
  phone?: string
  referralCode?: string
}

export interface UserResponse extends User {}
```

### Company Types
```typescript
// types/company.ts
export interface Company {
  id: number
  name: string
  email: string
  planId: number
  plan?: Plan
  wallet?: Wallet
  referredByEmployeeCode?: string
  address?: string
  phone?: string
  taxCode?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyRequest {
  name: string
  email: string
  planId: number
  referredByEmployeeCode?: string
  address?: string
  phone?: string
  taxCode?: string
}

export interface CompanyResponse extends Company {}
```

### Wallet Types
```typescript
// types/wallet.ts
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  BILLING = 'BILLING',
  REFUND = 'REFUND',
  COMMISSION = 'COMMISSION',
}

export interface Wallet {
  id: number
  companyId: number
  balance: number
  lastBillingDate: string
  nextBillingDate: string
  createdAt: string
  updatedAt: string
}

export interface WalletTransaction {
  id: number
  walletId: number
  transactionType: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  description?: string
  referenceId?: string
  createdAt: string
}

export interface WalletTransactionResponse extends WalletTransaction {}
```

### Deposit Types
```typescript
// types/deposit.ts
export enum DepositStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface DepositRequest {
  companyId: number
  amount: number
  transferProofUrl: string
}

export interface Deposit {
  id: number
  companyId: number
  company?: Company
  amount: number
  transferProofUrl: string
  status: DepositStatus
  approvedBy?: number
  approvedAt?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export interface DepositApprovalRequest {
  status: DepositStatus
  rejectionReason?: string
}

export interface DepositResponse extends Deposit {}
```

### Plan Types
```typescript
// types/plan.ts
export interface Plan {
  id: number
  name: string
  monthlyPrice: number
  maxEmployees: number
  active: boolean
  features?: string[]
  description?: string
  createdAt: string
  updatedAt: string
}

export interface PlanRequest {
  name: string
  monthlyPrice: number
  maxEmployees: number
  features?: string[]
  description?: string
}

export interface PlanResponse extends Plan {}
```

### Auth Types
```typescript
// types/auth.ts
export interface LoginRequest {
  identifier: string // email or employeeCode
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  name: string
  companyName?: string
  planId?: number
  referralCode?: string
}

export interface VerifyRequest {
  email: string
  temporaryPassword: string
  newPassword: string
}
```

## Component Props Types

### Table Props
```typescript
// types/table.ts
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  searchKey?: string
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  loading?: boolean
}

export interface DataTablePaginationProps {
  pageIndex: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}
```

### Dialog Props
```typescript
// types/dialog.ts
export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
}

export interface ConfirmDialogProps extends DialogProps {
  onConfirm: () => Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export interface FormDialogProps<T> extends DialogProps {
  initialData?: T
  onSubmit: (data: T) => Promise<void>
}
```

### Form Props
```typescript
// types/form.ts
export interface FormFieldProps {
  label: string
  name: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export interface SelectFieldProps extends FormFieldProps {
  options: SelectOption[]
}

export interface SelectOption {
  label: string
  value: string | number
}
```

## Navigation Types
```typescript
// types/nav.ts
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string | number
  children?: NavItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}
```

## Utility Types

### API Helpers
```typescript
// types/api-helpers.ts
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

export type AsyncFunction<T = void> = () => Promise<T>

export type WithLoading<T> = {
  data: T | null
  loading: boolean
  error: string | null
}
```

### Form Helpers
```typescript
// types/form-helpers.ts
export type FormState<T> = {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
}

export type ValidationRule<T> = {
  field: keyof T
  validate: (value: T[keyof T]) => string | undefined
}
```

## Type Guards

### User Role Guards
```typescript
// lib/utils/type-guards.ts
import type { UserRole } from '@/types/user'

export function isTamabeeRole(role: UserRole): boolean {
  return [
    'ADMIN_TAMABEE',
    'MANAGER_TAMABEE',
    'EMPLOYEE_TAMABEE',
  ].includes(role)
}

export function isCompanyRole(role: UserRole): boolean {
  return [
    'ADMIN_COMPANY',
    'MANAGER_COMPANY',
    'EMPLOYEE_COMPANY',
  ].includes(role)
}

export function canManageEmployees(role: UserRole): boolean {
  return ['ADMIN_COMPANY', 'MANAGER_COMPANY'].includes(role)
}

export function canApproveDeposits(role: UserRole): boolean {
  return ['ADMIN_TAMABEE', 'MANAGER_TAMABEE'].includes(role)
}
```

## Best Practices

1. **Organize by Domain**
   - Group related types in same file
   - Use clear file names (user.ts, company.ts)
   - Export all types from types/index.ts

2. **Naming Conventions**
   - Interfaces: PascalCase (User, Company)
   - Enums: PascalCase (UserRole, DepositStatus)
   - Types: PascalCase (ApiResponse)
   - Props: ComponentNameProps (UserCardProps)

3. **Reusability**
   - Create generic types for common patterns
   - Use utility types (Partial, Pick, Omit)
   - Extend base types when appropriate

4. **Type Safety**
   - Never use 'any'
   - Use 'unknown' if type is truly unknown
   - Use type guards for runtime checks
   - Leverage TypeScript strict mode

5. **Documentation**
   - Add JSDoc comments for complex types
   - Document enum values
   - Explain non-obvious type choices
