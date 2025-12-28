# TypeScript Types

## Core Types

```typescript
// User
interface User {
  id: number;
  employeeCode: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: number;
  status: UserStatus;
}

// Company
interface Company {
  id: number;
  name: string;
  email: string;
  planId: number;
  wallet?: Wallet;
}

// Wallet
interface Wallet {
  id: number;
  companyId: number;
  balance: number;
  lastBillingDate: string;
  nextBillingDate: string;
}
```

## Enums

```typescript
enum UserRole {
  ADMIN_TAMABEE = "ADMIN_TAMABEE",
  MANAGER_TAMABEE = "MANAGER_TAMABEE",
  EMPLOYEE_TAMABEE = "EMPLOYEE_TAMABEE",
  ADMIN_COMPANY = "ADMIN_COMPANY",
  MANAGER_COMPANY = "MANAGER_COMPANY",
  EMPLOYEE_COMPANY = "EMPLOYEE_COMPANY",
}

enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
}

enum TransactionType {
  DEPOSIT = "DEPOSIT",
  BILLING = "BILLING",
  REFUND = "REFUND",
  COMMISSION = "COMMISSION",
}

enum DepositStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}
```

## API Response Types

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
  first: boolean;
  last: boolean;
}
```

## Rules

- KHÔNG dùng `any` type
- Define all types in `types/` directory
- Use generics for reusable functions
- Use type guards for runtime checks
