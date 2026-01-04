# TypeScript Types

## Core Types

```typescript
interface User {
  id: number;
  employeeCode: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: number;
  status: UserStatus;
}

interface Company {
  id: number;
  name: string;
  email: string;
  planId: number;
  wallet?: Wallet;
}

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

## Enums Pattern

Enums chỉ chứa values, translations trong message files:

```typescript
// types/enums.ts
export const UserRole = {
  ADMIN_TAMABEE: "ADMIN_TAMABEE",
  MANAGER_TAMABEE: "MANAGER_TAMABEE",
  EMPLOYEE_TAMABEE: "EMPLOYEE_TAMABEE",
  ADMIN_COMPANY: "ADMIN_COMPANY",
  MANAGER_COMPANY: "MANAGER_COMPANY",
  EMPLOYEE_COMPANY: "EMPLOYEE_COMPANY",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

```json
// messages/en.json
{
  "enums": {
    "userRole": {
      "ADMIN_TAMABEE": "Tamabee Admin",
      "ADMIN_COMPANY": "Company Admin"
    }
  }
}
```

## Key Enums

- `UserRole`, `UserStatus`
- `DepositStatus`, `TransactionType`
- `AttendanceStatus`, `LeaveStatus`
- `PayrollStatus`, `ContractType`
- `Gender`, `CommissionStatus`

## Rules

- KHÔNG dùng `any`
- Define types trong `types/` directory
- Dùng `getEnumLabel()` cho translated labels
