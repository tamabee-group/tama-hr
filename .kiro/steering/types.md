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

Enums chỉ chứa values, **KHÔNG** chứa translations. Translations nằm trong message files.

```typescript
// types/enums.ts - Chỉ chứa enum values
export const DepositStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const TransactionType = {
  DEPOSIT: "DEPOSIT",
  BILLING: "BILLING",
  REFUND: "REFUND",
  COMMISSION: "COMMISSION",
} as const;

export const UserRole = {
  ADMIN_TAMABEE: "ADMIN_TAMABEE",
  MANAGER_TAMABEE: "MANAGER_TAMABEE",
  EMPLOYEE_TAMABEE: "EMPLOYEE_TAMABEE",
  ADMIN_COMPANY: "ADMIN_COMPANY",
  MANAGER_COMPANY: "MANAGER_COMPANY",
  EMPLOYEE_COMPANY: "EMPLOYEE_COMPANY",
} as const;

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
} as const;

export const CommissionStatus = {
  PENDING: "PENDING",
  ELIGIBLE: "ELIGIBLE",
  PAID: "PAID",
} as const;

export const Gender = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const;

// Derive types từ constants
export type DepositStatus = (typeof DepositStatus)[keyof typeof DepositStatus];
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
export type CommissionStatus =
  (typeof CommissionStatus)[keyof typeof CommissionStatus];
export type Gender = (typeof Gender)[keyof typeof Gender];
```

## Enum Translations (trong message files)

```json
// messages/en.json
{
  "enums": {
    "depositStatus": {
      "PENDING": "Pending",
      "APPROVED": "Approved",
      "REJECTED": "Rejected"
    },
    "transactionType": {
      "DEPOSIT": "Deposit",
      "BILLING": "Billing",
      "REFUND": "Refund",
      "COMMISSION": "Commission"
    },
    "userRole": {
      "ADMIN_TAMABEE": "Tamabee Admin",
      "MANAGER_TAMABEE": "Tamabee Manager",
      "EMPLOYEE_TAMABEE": "Tamabee Employee",
      "ADMIN_COMPANY": "Company Admin",
      "MANAGER_COMPANY": "Company Manager",
      "EMPLOYEE_COMPANY": "Company Employee"
    }
  }
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

## i18n Types

```typescript
// Translation function type
type TranslationFunction = ReturnType<typeof useTranslations>;

// Supported locales
type SupportedLocale = "vi" | "en" | "ja";

// Message namespaces
type MessageNamespace =
  | "common"
  | "auth"
  | "header"
  | "deposits"
  | "plans"
  | "companies"
  | "wallet"
  | "users"
  | "settings"
  | "enums"
  | "errors"
  | "validation"
  | "dialogs"
  | "commissions";
```

## Rules

- KHÔNG dùng `any` type
- Define all types in `types/` directory
- Use generics for reusable functions
- Use type guards for runtime checks
- Enums chỉ chứa values, translations nằm trong message files
- Sử dụng `getEnumLabel()` để lấy translated enum labels
