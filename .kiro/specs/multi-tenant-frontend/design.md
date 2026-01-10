# Design Document: Multi-Tenant Frontend

## Overview

Thiết kế chi tiết cho việc refactor frontend Tamabee HR sang kiến trúc multi-tenant với dynamic sidebar và route protection.

## Architecture

### Layout Structure

```
src/app/[locale]/
├── (HomeLayout)/              # Public pages (landing, pricing)
│   └── page.tsx
│
├── (NotFooter)/               # Auth pages (login, register)
│   ├── login/
│   └── register/
│
├── (TamabeeLayout)/           # Platform management (Tamabee admin only)
│   └── admin/
│       ├── companies/         # Quản lý công ty khách hàng
│       ├── deposits/          # Quản lý nạp tiền
│       ├── plans/             # Quản lý gói dịch vụ
│       └── settings/          # Cấu hình platform
│
└── (DashboardLayout)/         # HR features (tất cả users kể cả Tamabee)
    └── dashboard/
        ├── page.tsx           # Dashboard home
        ├── attendance/        # Chấm công
        │   ├── page.tsx       # Team attendance (admin/manager)
        │   └── me/            # My attendance (all)
        ├── payroll/           # Bảng lương
        │   ├── page.tsx       # Payroll management (admin)
        │   └── payslip/       # My payslip (all)
        ├── leaves/            # Nghỉ phép
        ├── employees/         # Quản lý nhân viên (admin/manager)
        ├── settings/          # Cấu hình công ty (admin)
        └── profile/           # Thông tin cá nhân (all)
```

### User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Login                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  JWT contains: { userId, email, role, tenantDomain, planId }    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tamabee Users (tenantDomain = "tamabee")                │   │
│  │                                                          │   │
│  │  ADMIN_TAMABEE ──────┬──→ /admin/*  (Platform mgmt)     │   │
│  │                      └──→ /dashboard/* (HR features)    │   │
│  │                                                          │   │
│  │  MANAGER_TAMABEE ────┬──→ /admin/*  (Limited platform)  │   │
│  │                      └──→ /dashboard/* (HR features)    │   │
│  │                                                          │   │
│  │  EMPLOYEE_TAMABEE ──────→ /dashboard/* (HR features)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Tenant Users (tenantDomain = "acme", "toyota", etc.)    │   │
│  │                                                          │   │
│  │  ADMIN_COMPANY ─────────→ /dashboard/* (HR + Settings)  │   │
│  │  MANAGER_COMPANY ───────→ /dashboard/* (HR + Team mgmt) │   │
│  │  EMPLOYEE_COMPANY ──────→ /dashboard/* (HR features)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Auth Context Enhancement

```typescript
// types/auth.ts
interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  companyId: number;
  tenantDomain: string; // "tamabee" cho Tamabee users
  planId: number;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Helpers
  isTamabeeUser: boolean; // tenantDomain === "tamabee"
  isTamabeeAdmin: boolean; // ADMIN_TAMABEE || MANAGER_TAMABEE
  isCompanyAdmin: boolean; // ADMIN_COMPANY || MANAGER_COMPANY
}

// hooks/use-auth.ts
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  const isTamabeeUser = context.user?.tenantDomain === "tamabee";
  const isTamabeeAdmin = ["ADMIN_TAMABEE", "MANAGER_TAMABEE"].includes(
    context.user?.role,
  );
  const isCompanyAdmin = ["ADMIN_COMPANY", "MANAGER_COMPANY"].includes(
    context.user?.role,
  );

  return { ...context, isTamabeeUser, isTamabeeAdmin, isCompanyAdmin };
}
```

### 2. Plan Features Context

```typescript
// types/plan.ts
interface PlanFeature {
  code: string; // "ATTENDANCE", "PAYROLL", "LEAVE", etc.
  enabled: boolean;
}

interface PlanFeaturesContextType {
  features: PlanFeature[];
  isLoading: boolean;
  hasFeature: (code: string) => boolean;
  refresh: () => Promise<void>;
}

// hooks/use-plan-features.ts
export function usePlanFeatures(): PlanFeaturesContextType {
  const context = useContext(PlanFeaturesContext);

  const hasFeature = useCallback(
    (code: string) => {
      return context.features.some((f) => f.code === code && f.enabled);
    },
    [context.features],
  );

  return { ...context, hasFeature };
}
```

### 3. Menu Items Configuration

```typescript
// constants/menu-items.ts
interface MenuItem {
  code: string;
  labelKey: string; // i18n key
  icon: LucideIcon;
  href: string;
  featureCode?: string; // Check plan feature (optional)
  roles?: UserRole[]; // Check user role (optional)
  children?: MenuItem[];
}

// Dashboard menu (HR features)
export const DASHBOARD_MENU_ITEMS: MenuItem[] = [
  {
    code: "dashboard",
    labelKey: "menu.dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    // Không có featureCode → luôn hiển thị
  },
  {
    code: "attendance",
    labelKey: "menu.attendance",
    icon: Clock,
    href: "/dashboard/attendance",
    featureCode: "ATTENDANCE",
    children: [
      {
        code: "my-attendance",
        labelKey: "menu.myAttendance",
        href: "/dashboard/attendance/me",
        // Tất cả roles đều thấy
      },
      {
        code: "team-attendance",
        labelKey: "menu.teamAttendance",
        href: "/dashboard/attendance/team",
        roles: [
          "ADMIN_TAMABEE",
          "MANAGER_TAMABEE",
          "ADMIN_COMPANY",
          "MANAGER_COMPANY",
        ],
      },
    ],
  },
  {
    code: "payroll",
    labelKey: "menu.payroll",
    icon: Wallet,
    href: "/dashboard/payroll",
    featureCode: "PAYROLL",
    children: [
      {
        code: "my-payslip",
        labelKey: "menu.myPayslip",
        href: "/dashboard/payroll/payslip",
      },
      {
        code: "payroll-management",
        labelKey: "menu.payrollManagement",
        href: "/dashboard/payroll",
        roles: ["ADMIN_TAMABEE", "ADMIN_COMPANY"],
      },
    ],
  },
  {
    code: "employees",
    labelKey: "menu.employees",
    icon: Users,
    href: "/dashboard/employees",
    roles: [
      "ADMIN_TAMABEE",
      "MANAGER_TAMABEE",
      "ADMIN_COMPANY",
      "MANAGER_COMPANY",
    ],
  },
  {
    code: "settings",
    labelKey: "menu.settings",
    icon: Settings,
    href: "/dashboard/settings",
    roles: ["ADMIN_TAMABEE", "ADMIN_COMPANY"],
  },
];

// Admin menu (Platform management - Tamabee only)
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    code: "companies",
    labelKey: "menu.companies",
    icon: Building,
    href: "/admin/companies",
  },
  {
    code: "deposits",
    labelKey: "menu.deposits",
    icon: CreditCard,
    href: "/admin/deposits",
  },
  {
    code: "plans",
    labelKey: "menu.plans",
    icon: Package,
    href: "/admin/plans",
  },
];
```

### 4. Dynamic Sidebar Component

```typescript
// components/sidebar.tsx
interface SidebarProps {
  menuItems: MenuItem[];
}

function Sidebar({ menuItems }: SidebarProps) {
  const { user } = useAuth();
  const { hasFeature } = usePlanFeatures();

  const filterMenuItems = useCallback((items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => {
        // Check feature từ plan
        if (item.featureCode && !hasFeature(item.featureCode)) {
          return false;
        }
        // Check role
        if (item.roles && !item.roles.includes(user?.role)) {
          return false;
        }
        return true;
      })
      .map(item => ({
        ...item,
        // Recursively filter children
        children: item.children ? filterMenuItems(item.children) : undefined,
      }))
      // Remove items with empty children
      .filter(item => !item.children || item.children.length > 0);
  }, [hasFeature, user?.role]);

  const visibleItems = useMemo(() => filterMenuItems(menuItems), [filterMenuItems, menuItems]);

  return (
    <nav>
      {visibleItems.map(item => (
        <SidebarItem key={item.code} item={item} />
      ))}
    </nav>
  );
}
```

### 5. Route Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "@/lib/utils/jwt";

const TAMABEE_ROLES = ["ADMIN_TAMABEE", "MANAGER_TAMABEE"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split("/")[1];

  // Public routes - không cần auth
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Không có token → redirect login
  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  try {
    const decoded = decodeJwt(token);
    const { role, tenantDomain } = decoded;

    // /admin/* routes - chỉ Tamabee admin
    if (pathname.includes("/admin")) {
      if (!TAMABEE_ROLES.includes(role)) {
        return NextResponse.redirect(
          new URL(`/${locale}/unauthorized`, request.url),
        );
      }
    }

    // /dashboard/* routes - cần tenantDomain (kể cả "tamabee")
    if (pathname.includes("/dashboard")) {
      if (!tenantDomain) {
        return NextResponse.redirect(
          new URL(`/${locale}/unauthorized`, request.url),
        );
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid token → redirect login
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
}

function isPublicRoute(pathname: string): boolean {
  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ];
  return publicPaths.some((path) => pathname.includes(path));
}
```

### 6. Tenant Domain Input Component

```typescript
// components/tenant-domain-input.tsx
interface TenantDomainInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function TenantDomainInput({ value, onChange, error }: TenantDomainInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const t = useTranslations("register");

  // Validate format
  const formatError = useMemo(() => {
    if (!value) return null;
    if (value.length < 3) return t("domainTooShort");
    if (value.length > 30) return t("domainTooLong");
    if (!/^[a-z0-9-]+$/.test(value)) return t("domainInvalidChars");
    if (value.startsWith("-") || value.endsWith("-")) return t("domainInvalidHyphen");
    return null;
  }, [value, t]);

  // Debounce check availability
  useEffect(() => {
    if (!value || value.length < 3 || formatError) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const result = await checkDomainAvailability(value);
        setIsAvailable(result.available);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, formatError]);

  return (
    <div>
      <div className="flex items-center">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          placeholder="your-company"
          className="rounded-r-none"
        />
        <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md">
          .tamabee.vn
        </span>
      </div>

      {/* Status indicator */}
      {isChecking && <span className="text-muted-foreground">{t("checking")}</span>}
      {!isChecking && isAvailable === true && (
        <span className="text-green-600 flex items-center gap-1">
          <Check className="w-4 h-4" /> {t("domainAvailable")}
        </span>
      )}
      {!isChecking && isAvailable === false && (
        <span className="text-red-600 flex items-center gap-1">
          <X className="w-4 h-4" /> {t("domainTaken")}
        </span>
      )}
      {formatError && <span className="text-red-600">{formatError}</span>}
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}
```

## Data Models

### JWT Payload

```typescript
interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  companyId: number;
  tenantDomain: string; // "tamabee" | "acme" | "toyota" | ...
  planId: number;
  exp: number;
  iat: number;
}
```

### Plan Features Response

```typescript
// GET /api/plans/{planId}/features
interface PlanFeaturesResponse {
  planId: number;
  planName: string;
  features: {
    code: string;
    name: string;
    enabled: boolean;
  }[];
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system._

### Property 1: Tenant Domain Validation

_For any_ input string, the tenant domain validation function SHALL return valid only if the string contains only lowercase letters, numbers, and hyphens, has length between 3-30 characters, and does not start or end with a hyphen.

**Validates: Requirements 1.2**

### Property 2: Sidebar Feature Filtering

_For any_ menu item with featureCode, the sidebar SHALL display the item only if hasFeature(featureCode) returns true. _For any_ menu item without featureCode, the sidebar SHALL always display the item (subject to role check).

**Validates: Requirements 3.2, 3.4**

### Property 3: Sidebar Role Filtering

_For any_ menu item with roles array, the sidebar SHALL display the item only if user.role is included in the roles array. _For any_ menu item without roles array, the sidebar SHALL display the item to all users (subject to feature check).

**Validates: Requirements 3.3, 3.5**

### Property 4: Nested Menu Filtering

_For any_ parent menu item with children, the sidebar SHALL recursively apply feature and role filtering to all children. _For any_ parent with all children filtered out, the sidebar SHALL hide the parent item.

**Validates: Requirements 3.6**

### Property 5: Admin Route Protection

_For any_ request to /admin/\* routes, the middleware SHALL allow access only for users with ADMIN_TAMABEE or MANAGER_TAMABEE role. All other roles SHALL be redirected to /unauthorized.

**Validates: Requirements 4.1**

### Property 6: Dashboard Route Protection

_For any_ request to /dashboard/\* routes, the middleware SHALL allow access only for users with valid tenantDomain in JWT (including "tamabee"). Users without tenantDomain SHALL be redirected to /unauthorized.

**Validates: Requirements 4.2, 4.5**

### Property 7: hasFeature Helper

_For any_ feature code, hasFeature(code) SHALL return true if and only if the features array contains an entry with matching code and enabled = true.

**Validates: Requirements 6.3**

## Error Handling

| Error Case                             | Action                            |
| -------------------------------------- | --------------------------------- |
| No access token                        | Redirect to /login                |
| Invalid/expired token                  | Clear token, redirect to /login   |
| Missing tenantDomain for /dashboard/\* | Redirect to /unauthorized         |
| Non-Tamabee role for /admin/\*         | Redirect to /unauthorized         |
| API returns 401                        | Clear token, redirect to /login   |
| Domain validation failed               | Show inline error, disable submit |
| Domain already taken                   | Show inline error, disable submit |

## Testing Strategy

### Unit Tests

- Domain validation: format rules, edge cases
- Sidebar filtering: feature and role logic
- hasFeature helper: various feature codes
- Middleware: route protection logic

### Property-Based Tests (fast-check)

```typescript
import fc from "fast-check";

// Property 1: Domain validation
test.prop([fc.string()])("domain validation", (input) => {
  const result = validateTenantDomain(input);
  if (result.valid) {
    expect(input).toMatch(/^[a-z0-9-]+$/);
    expect(input.length).toBeGreaterThanOrEqual(3);
    expect(input.length).toBeLessThanOrEqual(30);
    expect(input).not.toMatch(/^-|-$/);
  }
});

// Property 2-4: Sidebar filtering
test.prop([
  fc.array(fc.record({ code: fc.string(), enabled: fc.boolean() })),
  fc.constantFrom(...Object.values(UserRole)),
])("sidebar filtering", (features, role) => {
  const visibleItems = filterMenuItems(MENU_ITEMS, features, role);
  // Verify all visible items pass feature and role checks
});
```

### Integration Tests

- Login flow: verify JWT contains tenantDomain
- Sidebar rendering: verify correct items shown
- Route protection: verify redirects work
- Registration: verify domain input works
