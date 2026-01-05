# SaaS Multi-Tenant Architecture - Database per Tenant

## Tổng quan

Kiến trúc multi-tenant với mỗi tenant (company) có database riêng biệt, đảm bảo:

- **Data isolation**: Dữ liệu hoàn toàn tách biệt giữa các tenant
- **Security**: Không có rủi ro data leak giữa các tenant
- **Scalability**: Dễ dàng scale từng tenant độc lập
- **Compliance**: Đáp ứng yêu cầu pháp lý về lưu trữ dữ liệu

### Giải thích đơn giản

**Tenant là gì?**

- Tenant = 1 công ty khách hàng sử dụng hệ thống Tamabee
- Mỗi công ty đăng ký sẽ được cấp 1 tenant riêng

**Tenant Domain là gì?**

- Tenant domain = subdomain riêng cho mỗi công ty
- Ví dụ: `acme.tamabee.com`, `toyota.tamabee.com`
- User chọn domain khi đăng ký, hệ thống validate xem đã tồn tại chưa
- **tenantDomain = tenantId = dbName** (đơn giản hóa, vì đã unique)

Ví dụ: User chọn domain `acme` →

- tenantId = `acme`
- dbName = `tamabee_acme`
- URL = `acme.tamabee.com`

**Tại sao cần database riêng cho mỗi tenant?**

1. **An toàn dữ liệu**: Công ty A không thể xem dữ liệu công ty B dù có lỗi code
2. **Dễ backup/restore**: Backup từng công ty độc lập
3. **Tuân thủ pháp luật**: Một số nước yêu cầu dữ liệu phải lưu riêng
4. **Hiệu suất**: Công ty lớn không ảnh hưởng công ty nhỏ

---

## Registration Flow với Tenant Domain

### Các bước đăng ký hiện tại

| Step   | Nội dung                                       | Thay đổi               |
| ------ | ---------------------------------------------- | ---------------------- |
| Step 1 | Thông tin công ty (tên, email, phone, địa chỉ) | **Thêm tenant domain** |
| Step 2 | Xác thực email (OTP)                           | Không đổi              |
| Step 3 | Tạo mật khẩu                                   | Không đổi              |
| Step 4 | Xác nhận và submit                             | Hiển thị tenant domain |

### Chi tiết Step 1 - Thêm Tenant Domain

**Tại sao thêm vào Step 1?**

1. Step 1 đã chứa thông tin công ty → tenant domain liên quan đến công ty
2. Validate domain trước khi gửi OTP → tránh lãng phí email nếu domain đã tồn tại
3. User có thể sửa domain ngay nếu bị trùng

**UI mới:**

```
┌─────────────────────────────────────────────────────────────┐
│  Tên công ty:     [Công ty ABC                           ]  │
│  Email:           [contact@abc.com                       ]  │
│  Điện thoại:      [0901234567                            ]  │
│  ...                                                        │
│                                                             │
│  Tenant Domain:   [abc        ] .tamabee.com               │
│                   ✓ Domain khả dụng                        │
│                   ✗ Domain đã được sử dụng                 │
└─────────────────────────────────────────────────────────────┘
```

**Validation rules:**

- Chỉ cho phép: chữ thường, số, dấu gạch ngang
- Độ dài: 3-30 ký tự
- Không được bắt đầu/kết thúc bằng dấu gạch ngang
- Không được trùng với domain đã tồn tại
- Không được dùng các từ reserved: `admin`, `api`, `www`, `app`, `mail`, `tamabee`

**API validate:**

```typescript
// GET /api/auth/check-domain?domain=abc
// Response: { available: true } hoặc { available: false }
```

**Khi nào validate?**

- Debounce 500ms sau khi user ngừng gõ
- Validate lại khi click "Tiếp tục"

### Backend xử lý

```java
// AuthController.java
@GetMapping("/check-domain")
public ResponseEntity<BaseResponse<DomainCheckResponse>> checkDomain(
    @RequestParam String domain
) {
    // Validate format
    if (!isValidDomainFormat(domain)) {
        return ResponseEntity.badRequest().body(
            BaseResponse.error("Invalid domain format")
        );
    }

    // Check reserved words
    if (isReservedDomain(domain)) {
        return ResponseEntity.ok(BaseResponse.success(
            new DomainCheckResponse(false, "Domain is reserved")
        ));
    }

    // Check existence
    boolean available = !companyRepository.existsByTenantDomain(domain);
    return ResponseEntity.ok(BaseResponse.success(
        new DomainCheckResponse(available)
    ));
}
```

### Database Schema Update

```sql
-- Thêm cột tenant_domain vào bảng companies
ALTER TABLE companies ADD COLUMN tenant_domain VARCHAR(50) UNIQUE;

-- Index cho lookup nhanh
CREATE UNIQUE INDEX idx_companies_tenant_domain ON companies(tenant_domain);
```

### Frontend Implementation

```typescript
// types/register.ts - Thêm field mới
interface RegisterFormData {
  // ... existing fields
  tenantDomain: string;
}

// _step-1.tsx - Thêm input
const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
const [checkingDomain, setCheckingDomain] = useState(false);

// Debounce check domain
useEffect(() => {
  if (!formData.tenantDomain || formData.tenantDomain.length < 3) {
    setDomainAvailable(null);
    return;
  }

  const timer = setTimeout(async () => {
    setCheckingDomain(true);
    const result = await checkDomainAvailability(formData.tenantDomain);
    setDomainAvailable(result.available);
    setCheckingDomain(false);
  }, 500);

  return () => clearTimeout(timer);
}, [formData.tenantDomain]);
```

---

## Architecture Overview

### Giải thích sơ đồ

**Tầng 1 - Frontend (Next.js)**

- Giao diện người dùng, chia thành 4 khu vực:
  - `Tamabee Admin`: Quản trị viên Tamabee quản lý tất cả công ty
  - `Company Admin`: Admin của từng công ty quản lý nhân viên
  - `Employee Portal`: Nhân viên chấm công, xem lương
  - `Public Landing`: Trang giới thiệu, đăng ký

**Tầng 2 - Backend (Spring Boot)**

- Xử lý logic nghiệp vụ
- `TenantResolver`: Đọc JWT token để biết user thuộc công ty nào
- `TenantContext`: Lưu thông tin tenant trong ThreadLocal
- `DataSource Routing`: Tự động chuyển đến database đúng

**Tầng 3 - Database**

- `Master DB`: Lưu thông tin chung (companies, users, plans, billing)
- `Tenant DBs`: Mỗi công ty 1 database riêng (attendance, payroll, leaves)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         (Next.js App Router)                            │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Tamabee   │  │   Company   │  │  Employee   │  │   Public    │   │
│  │    Admin    │  │    Admin    │  │    Portal   │  │   Landing   │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                              │                                          │
│                    ┌─────────┴─────────┐                               │
│                    │   Tenant Context  │                               │
│                    │   (from JWT/URL)  │                               │
│                    └───────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                      (Spring Boot + JPA)                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      API Gateway / Filter                         │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │  │
│  │  │ TenantResolver  │→ │ TenantContext   │→ │ DataSource      │  │  │
│  │  │ (JWT/Header)    │  │ (ThreadLocal)   │  │ Routing         │  │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│  ┌────────────────────────────────┼────────────────────────────────┐   │
│  │                         Service Layer                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│  │  │   Admin     │  │   Company   │  │    Core     │              │   │
│  │  │  Services   │  │  Services   │  │  Services   │              │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    ┌──────────────────────────────────────────┐  │
│  │   MASTER DB      │    │           TENANT DATABASES               │  │
│  │   (tamabee_hr)   │    │                                          │  │
│  │                  │    │  ┌────────────┐  ┌────────────┐          │  │
│  │  • companies     │    │  │ tamabee_   │  │ tamabee_   │          │  │
│  │  • users (basic) │    │  │   acme     │  │   toyota   │  ...     │  │
│  │  • plans         │    │  │            │  │            │          │  │
│  │  • wallets       │    │  │ • users    │  │ • users    │          │  │
│  │  • deposits      │    │  │ • profiles │  │ • profiles │          │  │
│  │  • commissions   │    │  │ • settings │  │ • settings │          │  │
│  │  • tenant_config │    │  │ • attendance│ │ • attendance│         │  │
│  │                  │    │  │ • payroll  │  │ • payroll  │          │  │
│  └──────────────────┘    │  │ • leaves   │  │ • leaves   │          │  │
│                          └──────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Giải thích tổng quan Backend

Backend có nhiệm vụ:

1. **Nhận request** từ frontend với JWT token
2. **Xác định tenant** từ JWT (user thuộc công ty nào)
3. **Chuyển đến database đúng** của công ty đó
4. **Thực thi query** và trả về kết quả

### 1. Database Configuration

#### Giải thích cấu trúc Database

**Master Database (tamabee_hr)**

- Database chung của Tamabee, lưu:
  - `companies`: Danh sách công ty khách hàng
  - `users`: Thông tin đăng nhập cơ bản (email, password, role)
  - `plans`: Các gói dịch vụ
  - `wallets`: Ví tiền của công ty
  - `deposits`: Lịch sử nạp tiền
  - `commissions`: Hoa hồng giới thiệu

**Tenant Database (tamabee_acme, tamabee_toyota, ...)**

- Mỗi công ty có 1 database riêng, lưu:
  - `user_profiles`: Thông tin chi tiết nhân viên
  - `company_settings`: Cấu hình chấm công, lương
  - `attendance_records`: Dữ liệu chấm công
  - `payroll_records`: Bảng lương
  - `leave_requests`: Đơn xin nghỉ phép

#### Master Database Schema

```sql
-- Master DB: tamabee_hr (quản lý bởi Tamabee)
CREATE TABLE companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tenant_domain VARCHAR(50) UNIQUE NOT NULL,  -- "acme" (cũng là tenantId)
    db_host VARCHAR(255) DEFAULT 'localhost',
    db_port INT DEFAULT 5432,
    -- db_name = "tamabee_" + tenant_domain (không cần lưu riêng)
    db_username VARCHAR(100),
    db_password_encrypted TEXT,
    plan_id BIGINT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    employee_code VARCHAR(6) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    company_id BIGINT REFERENCES companies(id),
    tenant_domain VARCHAR(50),               -- Denormalized for quick lookup
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    max_employees INT,
    price_per_employee DECIMAL(10,2),
    features JSONB
);

CREATE TABLE wallets (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT REFERENCES companies(id),
    balance DECIMAL(15,2) DEFAULT 0,
    last_billing_date DATE,
    next_billing_date DATE
);

-- Các bảng billing, deposits, commissions... giữ ở Master DB
```

#### Tenant Database Schema Template

```sql
-- Tenant DB: tamabee_tenant_{id}
-- Mỗi tenant có schema giống nhau

CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,                 -- Reference to master.users.id
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    -- ... other profile fields
    created_at TIMESTAMP DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE company_settings (
    id BIGSERIAL PRIMARY KEY,
    attendance_config JSONB,
    payroll_config JSONB,
    overtime_config JSONB,
    break_config JSONB,
    allowance_config JSONB,
    deduction_config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    status VARCHAR(20),
    -- ... other fields
    created_at TIMESTAMP DEFAULT NOW(),
    deleted BOOLEAN DEFAULT FALSE
);

-- Các bảng khác: shifts, schedules, leaves, payroll_records, etc.
```

### 2. Tenant Resolution Flow

#### Giải thích luồng xác định Tenant

Khi user gửi request đến backend, hệ thống cần biết user thuộc công ty nào để query đúng database. Quá trình này gọi là **Tenant Resolution**.

**Các bước xử lý:**

1. **Bước 1 - Nhận request với JWT token**
   - Frontend gửi request kèm header `Authorization: Bearer {token}`
   - JWT token chứa thông tin: `userId`, `email`, `role`, `tenantDomain`

2. **Bước 2 - TenantFilter đọc JWT**
   - Filter chạy trước Controller
   - Giải mã JWT để lấy `tenantDomain` (ví dụ: `acme`)
   - Lưu vào `TenantContext` (ThreadLocal)

3. **Bước 3 - DataSource Routing**
   - Khi Repository thực thi query
   - `TenantRoutingDataSource` đọc `TenantContext.getCurrentTenant()`
   - Trả về connection đến database `tamabee_acme`

4. **Bước 4 - Query thực thi**
   - Query chạy trên database của tenant đó
   - Kết quả trả về cho user

```
┌─────────────────────────────────────────────────────────────────┐
│                      Request Flow                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Request arrives with JWT token                              │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Authorization: Bearer eyJhbGciOiJIUzI1NiIs...       │    │
│     │ JWT Payload: { userId, email, role, tenantDomain }  │    │
│     └─────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  2. TenantFilter extracts tenantDomain                          │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ TenantContext.setCurrentTenant("acme")              │    │
│     └─────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  3. DataSource routing based on tenant                          │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ AbstractRoutingDataSource.determineCurrentLookupKey()│   │
│     │ → Returns "acme"                                     │    │
│     │ → Routes to tamabee_acme database                   │    │
│     └─────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  4. Service executes with tenant-specific DB                    │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ attendanceRepository.findByUserId(userId)           │    │
│     │ → Queries tamabee_acme.attendance_records           │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Key Components

#### Giải thích các thành phần chính

**TenantContext (ThreadLocal)**

- Lưu trữ `tenantDomain` trong ThreadLocal
- ThreadLocal = biến riêng cho mỗi thread (mỗi request là 1 thread)
- Đảm bảo request A không đọc được tenantDomain của request B

**TenantFilter**

- Chạy đầu tiên khi có request đến
- Đọc JWT token từ header `Authorization`
- Giải mã để lấy `tenantDomain`
- Lưu vào `TenantContext`
- Cuối request: clear TenantContext để tránh memory leak

**TenantRoutingDataSource**

- Kế thừa `AbstractRoutingDataSource` của Spring
- Override method `determineCurrentLookupKey()`
- Trả về `tenantDomain` từ `TenantContext`
- Spring tự động chọn DataSource tương ứng

#### TenantContext (ThreadLocal)

```java
public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    public static void setCurrentTenant(String tenantDomain) {
        CURRENT_TENANT.set(tenantDomain);
    }

    public static String getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
```

#### TenantFilter

```java
@Component
@Order(1)
public class TenantFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) {
        try {
            String tenantDomain = extractTenantFromJwt(request);
            if (tenantDomain != null) {
                TenantContext.setCurrentTenant(tenantDomain);
            }
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
```

#### MultiTenantDataSource

```java
public class TenantRoutingDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContext.getCurrentTenant();
    }
}
```

### 4. Package Structure

#### Giải thích cấu trúc thư mục

Sau khi refactor, backend sẽ có cấu trúc mới:

- **config/**: Cấu hình multi-tenant
  - `MultiTenantConfig.java`: Cấu hình DataSource routing
  - `FlywayMultiTenantConfig.java`: Chạy migration cho từng tenant

- **filter/**: Xử lý request
  - `TenantFilter.java`: Đọc tenant từ JWT
  - `TenantContext.java`: Lưu tenant trong ThreadLocal

- **datasource/**: Quản lý kết nối database
  - `TenantRoutingDataSource.java`: Chọn database theo tenant
  - `TenantDataSourceManager.java`: Quản lý pool connection
  - `TenantDatabaseInitializer.java`: Tạo database mới cho tenant

- **service/master/**: Services làm việc với Master DB
  - Quản lý companies, plans, billing

- **service/tenant/**: Services làm việc với Tenant DB
  - Attendance, payroll, leaves

- **repository/master/** và **repository/tenant/**: Tương tự

```
src/main/java/com/tamabee/api_hr/
├── config/
│   ├── MultiTenantConfig.java          # DataSource configuration
│   ├── TenantDataSourceProperties.java # Tenant DB properties
│   └── FlywayMultiTenantConfig.java    # Migration per tenant
├── filter/
│   ├── TenantFilter.java               # Extract tenant from request
│   └── TenantContext.java              # ThreadLocal holder
├── datasource/
│   ├── TenantRoutingDataSource.java    # Route to correct DB
│   ├── TenantDataSourceManager.java    # Manage tenant connections
│   └── TenantDatabaseInitializer.java  # Create new tenant DB
├── service/
│   ├── master/                         # Services for Master DB
│   │   ├── CompanyService.java
│   │   ├── PlanService.java
│   │   └── BillingService.java
│   └── tenant/                         # Services for Tenant DB
│       ├── AttendanceService.java
│       ├── PayrollService.java
│       └── LeaveService.java
└── repository/
    ├── master/                         # Repositories for Master DB
    │   ├── CompanyRepository.java
    │   └── UserRepository.java
    └── tenant/                         # Repositories for Tenant DB
        ├── AttendanceRepository.java
        └── PayrollRepository.java
```

---

## Frontend Architecture

### Giải thích Frontend

**Trước refactor (hiện tại):**

- Chia nhiều layout theo role: `/tamabee/*`, `/company/*`, `/employee/*`
- Mỗi layout có sidebar riêng, code duplicate nhiều
- Khó maintain khi thêm feature mới

**Sau refactor:**

- Chỉ 2 layout: `/admin/*` (Tamabee) và `/dashboard/*` (Tenant users)
- Sidebar dynamic dựa trên **Plan Features** + **User Role**
- Code gọn hơn, dễ maintain, dễ upsell features

### Dynamic Sidebar Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dynamic Sidebar Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User Login → JWT chứa { role, tenantDomain, planId }        │
│                              │                                   │
│                              ▼                                   │
│  2. Fetch Plan Features                                         │
│     GET /api/plans/{planId}/features                            │
│     Response: {                                                 │
│       features: [                                               │
│         { code: "ATTENDANCE", enabled: true },                  │
│         { code: "PAYROLL", enabled: true },                     │
│         { code: "LEAVE", enabled: false },                      │
│         { code: "REPORTS", enabled: true }                      │
│       ]                                                         │
│     }                                                           │
│                              │                                   │
│                              ▼                                   │
│  3. Filter Menu Items by Role + Features                        │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ ADMIN_COMPANY sees:                                  │    │
│     │   ✓ Dashboard (always)                              │    │
│     │   ✓ Attendance (feature enabled)                    │    │
│     │   ✓ Payroll (feature enabled)                       │    │
│     │   ✗ Leave (feature disabled by plan)                │    │
│     │   ✓ Reports (feature enabled)                       │    │
│     │   ✓ Settings (admin only)                           │    │
│     │   ✓ Employees (admin only)                          │    │
│     └─────────────────────────────────────────────────────┘    │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ EMPLOYEE_COMPANY sees:                               │    │
│     │   ✓ Dashboard (always)                              │    │
│     │   ✓ My Attendance (feature enabled)                 │    │
│     │   ✓ My Payslip (feature enabled)                    │    │
│     │   ✗ Leave (feature disabled by plan)                │    │
│     │   ✗ Settings (admin only)                           │    │
│     │   ✗ Employees (admin only)                          │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Menu Configuration

```typescript
// constants/menu-items.ts
interface MenuItem {
  code: string;
  labelKey: string;
  icon: LucideIcon;
  href: string;
  featureCode?: string; // Nếu có, check plan feature
  roles?: UserRole[]; // Nếu có, check user role
  children?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
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
    featureCode: "ATTENDANCE", // Check plan
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
        roles: ["ADMIN_COMPANY", "MANAGER_COMPANY"], // Chỉ admin/manager
      },
    ],
  },
  {
    code: "employees",
    labelKey: "menu.employees",
    icon: Users,
    href: "/dashboard/employees",
    roles: ["ADMIN_COMPANY", "MANAGER_COMPANY"], // Admin only
  },
  {
    code: "settings",
    labelKey: "menu.settings",
    icon: Settings,
    href: "/dashboard/settings",
    roles: ["ADMIN_COMPANY"], // Admin only
  },
];
```

### Sidebar Component

```typescript
// components/sidebar.tsx
function Sidebar() {
  const { user } = useAuth();
  const { features } = usePlanFeatures();  // Fetch từ API hoặc context

  const visibleItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      // Check feature từ plan
      if (item.featureCode && !features.includes(item.featureCode)) {
        return false;
      }
      // Check role
      if (item.roles && !item.roles.includes(user.role)) {
        return false;
      }
      return true;
    });
  }, [features, user.role]);

  return (
    <nav>
      {visibleItems.map(item => (
        <SidebarItem key={item.code} item={item} />
      ))}
    </nav>
  );
}
```

### Folder Structure sau refactor

```
src/app/[locale]/
├── (HomeLayout)/           # Public pages (landing, pricing)
├── (NotFooter)/            # Auth pages (login, register)
├── (TamabeeLayout)/        # Tamabee admin only (quản lý cross-tenant)
│   └── admin/
│       ├── companies/
│       ├── deposits/
│       ├── plans/
│       └── settings/
└── (DashboardLayout)/      # Tất cả tenant users
    └── dashboard/
        ├── page.tsx                    # Dashboard home
        ├── attendance/
        │   ├── page.tsx                # Team attendance (admin)
        │   └── me/page.tsx             # My attendance (all)
        ├── payroll/
        │   ├── page.tsx                # Payroll management (admin)
        │   └── payslip/page.tsx        # My payslip (all)
        ├── employees/
        │   └── page.tsx                # Employee list (admin)
        ├── settings/
        │   └── page.tsx                # Company settings (admin)
        └── profile/
            └── page.tsx                # User profile (all)
```

### Page-level Authorization

```typescript
// dashboard/employees/page.tsx
export default async function EmployeesPage() {
  const session = await getServerSession();

  // Server-side authorization
  if (!["ADMIN_COMPANY", "MANAGER_COMPANY"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return <EmployeeList />;
}
```

### Ưu điểm của Dynamic Sidebar

1. **Ít code hơn**: 1 layout cho tenant thay vì 3
2. **Dễ thêm feature**: Chỉ cần thêm vào `MENU_ITEMS` + plan
3. **Flexible pricing**: Upsell features dễ dàng (upgrade plan để mở thêm menu)
4. **Consistent UX**: Tất cả users cùng 1 giao diện, chỉ khác menu

### Tại sao Tamabee Admin cần layout riêng?

Tamabee admin (quản lý tất cả tenants) vẫn cần layout riêng vì:

- Không thuộc tenant nào → không có tenantDomain
- Cần access cross-tenant data (xem tất cả companies)
- Menu khác hoàn toàn (deposits, plans, billing)
- Security: tách biệt hoàn toàn với tenant users

### 1. Tenant Context Flow

#### Giải thích luồng xử lý

1. **User đăng nhập**: Gọi API login, nhận JWT token chứa `tenantDomain`, `planId`
2. **Lưu token**: Lưu vào cookie
3. **Fetch plan features**: Lấy danh sách features của plan
4. **Render sidebar**: Filter menu items theo features + role
5. **Gọi API**: Mỗi request gửi kèm JWT trong header

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Tenant Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User Login                                                  │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ POST /api/auth/login                                 │    │
│     │ Response: { accessToken, user: { tenantDomain, role } } │    │
│     └─────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  2. Store in Auth Context                                       │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ AuthContext: { user, tenantDomain, accessToken }    │    │
│     └─────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  3. API Client includes tenant in requests                      │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Headers: {                                           │    │
│     │   Authorization: Bearer {accessToken},              │    │
│     │   X-Tenant-Domain: {tenantDomain}  // Optional backup│    │
│     │ }                                                    │    │
│     └─────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  4. Route based on role                                         │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ ADMIN_TAMABEE  → /tamabee/*  (Master DB)            │    │
│     │ ADMIN_COMPANY  → /company/*  (Tenant DB)            │    │
│     │ EMPLOYEE       → /employee/* (Tenant DB)            │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. API Client Configuration

```typescript
// lib/utils/fetch-client.ts
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const session = await getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.accessToken}`,
    // Tenant ID đã được encode trong JWT, không cần header riêng
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response.json();
}
```

### 3. Route Protection

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");
  const pathname = request.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const decoded = decodeJwt(token.value);
  const { role, tenantDomain } = decoded;

  // Tamabee admin routes - chỉ cho phép tenantDomain = null hoặc "tamabee"
  if (pathname.startsWith("/tamabee")) {
    if (!["ADMIN_TAMABEE", "MANAGER_TAMABEE"].includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  // Company routes - yêu cầu có tenantDomain
  if (pathname.startsWith("/company") || pathname.startsWith("/employee")) {
    if (!tenantDomain) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}
```

---

## Tenant Lifecycle

### Giải thích vòng đời Tenant

Tenant có 2 giai đoạn chính:

1. **Provisioning**: Tạo mới khi công ty đăng ký
2. **Deprovisioning**: Xóa/Archive khi công ty ngừng sử dụng

### 1. Tenant Provisioning (Tạo mới company)

#### Giải thích từng bước

**Bước 1**: Admin Tamabee tạo công ty mới qua dashboard

- Nhập thông tin: tên công ty, email, gói dịch vụ

**Bước 2**: tenantDomain đã được user chọn khi đăng ký

- Ví dụ: user chọn `acme` → tenantDomain = `acme`
- Không cần generate, đã validate unique ở Step 1

**Bước 3**: Tạo database mới cho tenant

- Chạy lệnh SQL: `CREATE DATABASE tamabee_acme`

**Bước 4**: Chạy migration để tạo bảng

- Flyway tự động tạo các bảng: user_profiles, attendance_records, etc.

**Bước 5**: Insert dữ liệu mặc định

- Tạo company_settings với cấu hình mặc định

**Bước 6**: Đăng ký DataSource

- Thêm connection pool mới vào runtime
- Từ giờ request của tenant này sẽ được route đến database mới

**Bước 7**: Cập nhật Master DB

- Lưu thông tin database của tenant vào bảng `companies`

```
┌─────────────────────────────────────────────────────────────────┐
│                  New Tenant Provisioning                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Admin creates company in Tamabee dashboard                  │
│     POST /api/admin/companies                                   │
│     { name, email, planId, tenantDomain: "acme" }               │
│                              │                                   │
│                              ▼                                   │
│  2. tenantDomain already validated (unique check in Step 1)     │
│     tenantDomain = "acme" (user đã chọn khi đăng ký)            │
│                              │                                   │
│                              ▼                                   │
│  3. Create tenant database                                      │
│     CREATE DATABASE tamabee_acme;                               │
│                              │                                   │
│                              ▼                                   │
│  4. Run Flyway migrations on new DB                             │
│     flyway -url=jdbc:postgresql://localhost/tamabee_acme        │
│            -locations=classpath:db/tenant migrate               │
│                              │                                   │
│                              ▼                                   │
│  5. Insert default settings                                     │
│     INSERT INTO company_settings (...)                          │
│                              │                                   │
│                              ▼                                   │
│  6. Register DataSource in runtime                              │
│     TenantDataSourceManager.addTenant("acme", dataSource)       │
│                              │                                   │
│                              ▼                                   │
│  7. Update company status = ACTIVE                              │
│     Company ready to use at acme.tamabee.com                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Chi tiết kỹ thuật: Tự động tạo Database + Flyway Migration

#### Giải thích vấn đề

**Flyway bình thường hoạt động thế nào?**

- Khi app khởi động, Flyway chạy migration trên 1 database cố định
- Database phải tồn tại trước khi Flyway chạy

**Vấn đề với multi-tenant:**

- Mỗi tenant cần 1 database riêng
- Database được tạo runtime (khi công ty đăng ký)
- Flyway không tự động biết database mới

**Giải pháp:**

- Viết code để tạo database + chạy Flyway programmatically
- Gọi khi tạo tenant mới

#### Implementation

**1. TenantDatabaseInitializer - Tạo database mới**

```java
@Service
@RequiredArgsConstructor
public class TenantDatabaseInitializer {

    private final DataSource masterDataSource;  // Connection đến master DB
    private final TenantDataSourceProperties properties;

    /**
     * Tạo database mới cho tenant
     * Chạy khi công ty đăng ký thành công
     */
    @Transactional
    public void createTenantDatabase(String tenantDomain) {
        String dbName = "tamabee_" + tenantDomain;  // tamabee_acme

        // 1. Tạo database mới (PostgreSQL)
        try (Connection conn = masterDataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // Kiểm tra database đã tồn tại chưa
            ResultSet rs = stmt.executeQuery(
                "SELECT 1 FROM pg_database WHERE datname = '" + dbName + "'"
            );

            if (!rs.next()) {
                // Tạo database mới
                stmt.execute("CREATE DATABASE " + dbName);
                log.info("Created database: {}", dbName);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create database: " + dbName, e);
        }

        // 2. Chạy Flyway migration
        runFlywayMigration(tenantDomain, dbName);

        // 3. Insert default data
        insertDefaultData(tenantDomain, dbName);
    }

    /**
     * Chạy Flyway migration trên database mới
     */
    private void runFlywayMigration(String tenantDomain, String dbName) {
        Flyway flyway = Flyway.configure()
            .dataSource(
                properties.getUrl().replace("{dbName}", dbName),
                properties.getUsername(),
                properties.getPassword()
            )
            .locations("classpath:db/tenant")  // Folder chứa migration files
            .baselineOnMigrate(true)
            .load();

        flyway.migrate();
        log.info("Flyway migration completed for tenant: {}", tenantDomain);
    }

    /**
     * Insert dữ liệu mặc định cho tenant mới
     */
    private void insertDefaultData(String tenantDomain, String dbName) {
        // Tạo DataSource tạm để insert data
        HikariDataSource ds = createDataSource(dbName);

        try (Connection conn = ds.getConnection();
             Statement stmt = conn.createStatement()) {

            // Insert default company settings
            stmt.execute("""
                INSERT INTO company_settings (
                    attendance_config, payroll_config, overtime_config,
                    break_config, created_at
                ) VALUES (
                    '{"defaultWorkStartTime":"09:00","defaultWorkEndTime":"18:00"}',
                    '{"payDay":25,"cutoffDay":20}',
                    '{"overtimeEnabled":false}',
                    '{"breakEnabled":true,"defaultBreakMinutes":60}',
                    NOW()
                )
            """);

            log.info("Default data inserted for tenant: {}", tenantDomain);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to insert default data", e);
        } finally {
            ds.close();
        }
    }
}
```

**2. Flyway Migration Files cho Tenant**

```
src/main/resources/db/
├── master/                    # Migration cho Master DB
│   ├── V1__create_companies.sql
│   ├── V2__create_users.sql
│   └── V3__create_plans.sql
└── tenant/                    # Migration cho Tenant DB
    ├── V1__create_user_profiles.sql
    ├── V2__create_company_settings.sql
    ├── V3__create_attendance_records.sql
    └── V4__create_payroll_records.sql
```

**3. Tenant Migration Example**

```sql
-- db/tenant/V1__create_user_profiles.sql
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_deleted ON user_profiles(deleted);
```

**4. CompanyService - Gọi khi tạo company**

```java
@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements ICompanyService {

    private final CompanyRepository companyRepository;
    private final TenantDatabaseInitializer tenantDbInitializer;
    private final TenantDataSourceManager dataSourceManager;

    @Override
    @Transactional
    public CompanyResponse createCompany(CreateCompanyRequest request) {
        // 1. Tạo company record trong Master DB
        CompanyEntity company = new CompanyEntity();
        company.setName(request.getName());
        company.setEmail(request.getEmail());
        company.setTenantDomain(request.getTenantDomain());  // "acme"
        company.setPlanId(request.getPlanId());
        company.setStatus(CompanyStatus.PENDING);

        company = companyRepository.save(company);

        // 2. tenantDomain đã có từ request (user chọn khi đăng ký)
        String tenantDomain = request.getTenantDomain();  // "acme"
        // dbName = "tamabee_" + tenantDomain (không cần lưu riêng)

        // 3. Tạo database + chạy migration (async để không block)
        CompletableFuture.runAsync(() -> {
            try {
                // Tạo database và chạy Flyway
                tenantDbInitializer.createTenantDatabase(tenantDomain);

                // Đăng ký DataSource vào pool
                dataSourceManager.addTenant(tenantDomain);

                // Cập nhật status
                company.setStatus(CompanyStatus.ACTIVE);
                companyRepository.save(company);

                log.info("Tenant {} provisioned successfully", tenantDomain);
            } catch (Exception e) {
                company.setStatus(CompanyStatus.FAILED);
                companyRepository.save(company);
                log.error("Failed to provision tenant {}", tenantDomain, e);
            }
        });

        return companyMapper.toResponse(company);
    }
}
```

**5. TenantDataSourceManager - Quản lý DataSource runtime**

```java
@Component
@RequiredArgsConstructor
public class TenantDataSourceManager {

    private final Map<String, DataSource> tenantDataSources = new ConcurrentHashMap<>();
    private final TenantDataSourceProperties properties;

    /**
     * Thêm DataSource mới cho tenant
     * Gọi sau khi tạo database thành công
     */
    public void addTenant(String tenantDomain) {
        if (tenantDataSources.containsKey(tenantDomain)) {
            return;  // Đã tồn tại
        }

        String dbName = "tamabee_" + tenantDomain;
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(properties.getUrl().replace("{dbName}", dbName));
        ds.setUsername(properties.getUsername());
        ds.setPassword(properties.getPassword());
        ds.setMaximumPoolSize(10);
        ds.setMinimumIdle(2);

        tenantDataSources.put(tenantDomain, ds);
        log.info("DataSource added for tenant: {}", tenantDomain);
    }

    /**
     * Lấy DataSource của tenant
     * Gọi bởi TenantRoutingDataSource
     */
    public DataSource getDataSource(String tenantDomain) {
        return tenantDataSources.get(tenantDomain);
    }

    /**
     * Xóa DataSource khi tenant bị deactivate
     */
    public void removeTenant(String tenantDomain) {
        DataSource ds = tenantDataSources.remove(tenantDomain);
        if (ds instanceof HikariDataSource hikari) {
            hikari.close();
        }
        log.info("DataSource removed for tenant: {}", tenantDomain);
    }

    /**
     * Load tất cả tenant DataSources khi app khởi động
     */
    @PostConstruct
    public void loadAllTenants() {
        // Query master DB để lấy danh sách active tenants
        // Tạo DataSource cho mỗi tenant
    }
}
```

**6. Application Startup - Load existing tenants**

```java
@Component
@RequiredArgsConstructor
public class TenantDataSourceLoader implements ApplicationRunner {

    private final CompanyRepository companyRepository;
    private final TenantDataSourceManager dataSourceManager;

    @Override
    public void run(ApplicationArguments args) {
        // Load tất cả active companies từ Master DB
        List<CompanyEntity> activeCompanies = companyRepository
            .findByStatusAndDeletedFalse(CompanyStatus.ACTIVE);

        for (CompanyEntity company : activeCompanies) {
            try {
                dataSourceManager.addTenant(company.getTenantDomain());
                log.info("Loaded tenant: {}", company.getTenantDomain());
            } catch (Exception e) {
                log.error("Failed to load tenant: {}", company.getTenantDomain(), e);
            }
        }

        log.info("Loaded {} tenant DataSources", activeCompanies.size());
    }
}
```

#### Tóm tắt luồng xử lý

```
┌─────────────────────────────────────────────────────────────────┐
│              Flyway + Database Creation Flow                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  APP STARTUP:                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Flyway chạy migration trên Master DB                 │   │
│  │ 2. TenantDataSourceLoader query active companies        │   │
│  │ 3. Tạo DataSource cho mỗi existing tenant               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  NEW COMPANY REGISTRATION:                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Insert company vào Master DB (status = PENDING)      │   │
│  │ 2. tenantDomain đã có từ registration (user chọn)       │   │
│  │ 3. CREATE DATABASE tamabee_{tenantDomain}               │   │
│  │ 4. Flyway.migrate() trên database mới                   │   │
│  │ 5. Insert default settings                              │   │
│  │ 6. Thêm DataSource vào pool                             │   │
│  │ 7. Update company status = ACTIVE                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  RUNTIME REQUEST:                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. TenantFilter đọc tenantDomain từ JWT                 │   │
│  │ 2. TenantRoutingDataSource.determineCurrentLookupKey()  │   │
│  │ 3. TenantDataSourceManager.getDataSource(tenantDomain)  │   │
│  │ 4. Query chạy trên đúng tenant database                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Tenant Deprovisioning (Xóa/Archive company)

#### Giải thích các phương án

**Option A: Soft Delete (Khuyến nghị)**

- Đánh dấu công ty là INACTIVE, không xóa database
- Giữ data 30-90 ngày để tuân thủ pháp luật
- Có thể khôi phục nếu khách hàng quay lại

**Option B: Hard Delete**

- Xóa hoàn toàn database
- Chỉ dùng khi khách hàng yêu cầu xóa dữ liệu (GDPR)
- Phải backup trước khi xóa

```
┌─────────────────────────────────────────────────────────────────┐
│                  Tenant Deprovisioning                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Option A: Soft Delete (Recommended)                            │
│  ─────────────────────────────────────                          │
│  1. Mark company as INACTIVE in master DB                       │
│  2. Remove DataSource from pool                                 │
│  3. Keep database for compliance (30-90 days)                   │
│  4. Schedule cleanup job                                        │
│                                                                  │
│  Option B: Hard Delete                                          │
│  ─────────────────────────────────────                          │
│  1. Export data backup                                          │
│  2. DROP DATABASE tamabee_tenant_xxx;                           │
│  3. Delete company record from master                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Strategy

### Giải thích chiến lược chuyển đổi

Chuyển từ single database sang multi-tenant cần thực hiện cẩn thận theo 5 giai đoạn:

### Phase 1: Preparation (Chuẩn bị)

**Mục tiêu**: Xây dựng infrastructure mới mà không ảnh hưởng hệ thống hiện tại

- [ ] Tạo master database schema mới
- [ ] Tạo tenant database template
- [ ] Implement TenantContext và TenantFilter
- [ ] Implement MultiTenantDataSource

**Giải thích**:

- Viết code mới nhưng chưa deploy
- Test kỹ trên môi trường staging

### Phase 2: Data Migration (Di chuyển dữ liệu)

**Mục tiêu**: Tách dữ liệu từ single DB sang nhiều tenant DB

- [ ] Export data từ single DB hiện tại
- [ ] Tách data theo company_id
- [ ] Import vào từng tenant DB
- [ ] Verify data integrity

**Giải thích**:

- Viết script để export/import data
- Kiểm tra số lượng records khớp
- Chạy thử với 1-2 công ty trước

### Phase 3: Code Refactor (Sửa code)

**Mục tiêu**: Cập nhật code để sử dụng multi-tenant

- [ ] Tách repositories thành master/tenant
- [ ] Update services để sử dụng đúng repository
- [ ] Update JWT để include tenantDomain
- [ ] Update frontend auth flow

**Giải thích**:

- Đây là phần tốn thời gian nhất
- Cần review kỹ từng service

### Phase 4: Testing (Kiểm thử)

**Mục tiêu**: Đảm bảo hệ thống hoạt động đúng

- [ ] Unit tests cho tenant routing
- [ ] Integration tests cross-tenant isolation
- [ ] Performance testing với multiple tenants
- [ ] Security audit

**Giải thích**:

- Test quan trọng nhất: đảm bảo tenant A không thể xem data tenant B
- Load test với nhiều tenant đồng thời

### Phase 5: Deployment

- [ ] Deploy với feature flag
- [ ] Migrate existing companies one by one
- [ ] Monitor và rollback plan

**Giải thích**:

- Dùng feature flag để bật/tắt multi-tenant
- Migrate từng công ty một, không migrate hàng loạt
- Chuẩn bị kế hoạch rollback nếu có lỗi

---

## Security Considerations

### Giải thích bảo mật

Bảo mật là ưu tiên hàng đầu trong multi-tenant. Cần đảm bảo:

### Data Isolation (Cách ly dữ liệu)

- Mỗi tenant có database riêng → không thể query cross-tenant
- Connection pool riêng cho mỗi tenant
- Separate database credentials

**Tại sao quan trọng?**

- Dù có bug trong code, tenant A vẫn không thể xem data tenant B
- Nếu 1 database bị hack, các database khác vẫn an toàn

### Authentication (Xác thực)

- JWT chứa tenantDomain, được verify ở backend
- TenantFilter validate tenantDomain match với user's company
- Reject requests với mismatched tenantDomain

**Ví dụ tấn công và cách chặn:**

- Hacker sửa JWT để đổi tenantDomain → Backend verify signature, phát hiện JWT bị sửa
- Hacker dùng JWT của tenant A để gọi API tenant B → TenantFilter so sánh tenantDomain trong JWT với request, reject nếu không khớp

### Audit (Kiểm toán)

- Log tất cả tenant switches
- Monitor cross-tenant access attempts
- Regular security audits

**Tại sao cần audit?**

- Phát hiện sớm các hành vi bất thường
- Có bằng chứng khi xảy ra sự cố
- Tuân thủ quy định pháp luật (SOC2, ISO27001)

---

## Performance Considerations

### Giải thích hiệu suất

Multi-tenant có thể ảnh hưởng hiệu suất nếu không cấu hình đúng.

### Connection Pooling (Quản lý kết nối)

```yaml
# Mỗi tenant có connection pool riêng
tenant:
  datasource:
    hikari:
      maximum-pool-size: 10 # Per tenant
      minimum-idle: 2
      connection-timeout: 30000
```

**Giải thích:**

- `maximum-pool-size: 10`: Mỗi tenant tối đa 10 connections
- `minimum-idle: 2`: Luôn giữ 2 connections sẵn sàng
- Nếu có 100 tenants: 100 x 10 = 1000 connections tối đa

**Lưu ý:**

- Cần tính toán kỹ để không quá tải database server
- Tenant nhỏ có thể dùng ít connection hơn

### Caching (Bộ nhớ đệm)

- Cache tenant DataSource references
- Cache tenant configuration
- Invalidate cache khi tenant config thay đổi

**Tại sao cần cache?**

- Không cần lookup database mỗi request
- Giảm latency đáng kể

### Scaling (Mở rộng)

- Horizontal: Thêm read replicas per tenant
- Vertical: Upgrade DB resources cho tenant lớn
- Sharding: Group tenants theo region/size

**Chiến lược scaling:**

- Tenant nhỏ: Shared database server
- Tenant lớn: Dedicated database server
- Tenant enterprise: Dedicated cluster

---

## Monitoring

### Giải thích giám sát

Cần giám sát hệ thống để phát hiện sớm vấn đề.

### Metrics to Track (Các chỉ số cần theo dõi)

- Requests per tenant: Số request mỗi tenant
- Database connections per tenant: Số kết nối đang dùng
- Query performance per tenant: Thời gian query
- Error rates per tenant: Tỷ lệ lỗi

**Tại sao cần theo dõi per tenant?**

- Phát hiện tenant nào đang gặp vấn đề
- Billing chính xác theo usage
- Capacity planning

### Alerts (Cảnh báo)

- Tenant database connection failures: Database không kết nối được
- Cross-tenant access attempts: Có ai đó cố truy cập data tenant khác
- Unusual query patterns: Query bất thường (có thể là tấn công)

---

---

## Soft Delete Strategy

### Vấn đề hiện tại

Hiện tại `BaseEntity` có field `deleted` (soft delete) cho tất cả entities. Điều này gây ra:

1. **Performance kém**: Mỗi query đều phải filter `deleted = false`
2. **Index bloat**: Cần index trên `deleted` cho mọi bảng
3. **Data phình to**: Các bảng transaction không bao giờ được dọn dẹp

### Giải pháp

Bỏ `deleted` khỏi `BaseEntity`, chỉ thêm vào entities thực sự cần soft delete.

### Phân loại Entities

#### Entities CẦN soft delete (ít data, cần khôi phục)

| Entity                     | Lý do                                           |
| -------------------------- | ----------------------------------------------- |
| `UserEntity`               | Tài khoản có thể khôi phục, liên kết nhiều data |
| `UserProfileEntity`        | Gắn với User                                    |
| `CompanyEntity`            | Công ty có thể tạm ngưng rồi kích hoạt lại      |
| `CompanyProfileEntity`     | Gắn với Company                                 |
| `CompanySettingEntity`     | Cấu hình quan trọng                             |
| `PlanEntity`               | Gói dịch vụ có thể ẩn đi                        |
| `PlanFeatureEntity`        | Gắn với Plan                                    |
| `PlanFeatureCodeEntity`    | Master data                                     |
| `ShiftTemplateEntity`      | Template có thể tái sử dụng                     |
| `WorkScheduleEntity`       | Lịch làm việc có thể khôi phục                  |
| `HolidayEntity`            | Ngày lễ có thể sửa lại                          |
| `EmployeeSalaryEntity`     | Cấu hình lương quan trọng                       |
| `EmployeeAllowanceEntity`  | Phụ cấp có thể khôi phục                        |
| `EmployeeDeductionEntity`  | Khấu trừ có thể khôi phục                       |
| `EmploymentContractEntity` | Hợp đồng cần lưu trữ                            |
| `DepositRequestEntity`     | Yêu cầu nạp tiền cần audit                      |
| `WalletEntity`             | Ví tiền quan trọng                              |
| `TamabeeSettingEntity`     | Cấu hình hệ thống                               |

#### Entities KHÔNG cần soft delete (data lớn, xóa thẳng)

| Entity                              | Lý do                             |
| ----------------------------------- | --------------------------------- |
| `AttendanceRecordEntity`            | Data chấm công tăng hàng ngày     |
| `BreakRecordEntity`                 | Data giờ nghỉ tăng liên tục       |
| `PayrollRecordEntity`               | Bảng lương mỗi kỳ                 |
| `PayrollItemEntity`                 | Chi tiết lương, rất nhiều records |
| `PayrollPeriodEntity`               | Kỳ lương, có thể xóa thẳng        |
| `WalletTransactionEntity`           | Giao dịch ví tăng liên tục        |
| `AuditLogEntity`                    | Log hệ thống, có thể archive      |
| `WorkModeChangeLogEntity`           | Log thay đổi, có thể archive      |
| `MailHistoryEntity`                 | Lịch sử email, có thể xóa cũ      |
| `LeaveRequestEntity`                | Đơn nghỉ phép đã xử lý xong       |
| `LeaveBalanceEntity`                | Số dư phép, tính toán lại được    |
| `AttendanceAdjustmentRequestEntity` | Yêu cầu điều chỉnh đã xử lý       |
| `ShiftSwapRequestEntity`            | Yêu cầu đổi ca đã xử lý           |
| `ShiftAssignmentEntity`             | Phân ca cụ thể, data lớn          |
| `WorkScheduleAssignmentEntity`      | Phân lịch cụ thể                  |
| `ScheduleSelectionEntity`           | Lựa chọn lịch của nhân viên       |
| `EmployeeCommissionEntity`          | Hoa hồng đã tính xong             |
| `EmailVerificationEntity`           | OTP hết hạn thì xóa               |

### Implementation

#### 1. BaseEntity mới (không có deleted)

```java
@Data
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

#### 2. Entities cần soft delete - thêm field deleted

```java
@Entity
@Table(name = "users")
public class UserEntity extends BaseEntity {

    @Column(nullable = false)
    private Boolean deleted = false;

    // ... other fields
}
```

#### 3. Repository pattern

```java
// Entities CÓ soft delete
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    // Luôn filter deleted = false
    Optional<UserEntity> findByIdAndDeletedFalse(Long id);
    List<UserEntity> findByCompanyIdAndDeletedFalse(Long companyId);
}

// Entities KHÔNG có soft delete - query bình thường
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecordEntity, Long> {
    // Không cần filter deleted
    List<AttendanceRecordEntity> findByUserId(Long userId);
}
```

#### 4. Flyway Migration

```sql
-- V{x}__remove_deleted_from_high_volume_tables.sql

-- Xóa cột deleted khỏi các bảng data lớn
ALTER TABLE attendance_records DROP COLUMN IF EXISTS deleted;
ALTER TABLE break_records DROP COLUMN IF EXISTS deleted;
ALTER TABLE payroll_records DROP COLUMN IF EXISTS deleted;
ALTER TABLE payroll_items DROP COLUMN IF EXISTS deleted;
ALTER TABLE wallet_transactions DROP COLUMN IF EXISTS deleted;
ALTER TABLE audit_logs DROP COLUMN IF EXISTS deleted;
ALTER TABLE mail_histories DROP COLUMN IF EXISTS deleted;
ALTER TABLE leave_requests DROP COLUMN IF EXISTS deleted;
ALTER TABLE leave_balances DROP COLUMN IF EXISTS deleted;
-- ... các bảng khác

-- Xóa index deleted không cần thiết
DROP INDEX IF EXISTS idx_attendance_records_deleted;
DROP INDEX IF EXISTS idx_break_records_deleted;
-- ... các index khác
```

### Lợi ích

1. **Query nhanh hơn**: Không cần filter `deleted = false` cho 60% entities
2. **Index nhỏ hơn**: Bỏ index `deleted` trên các bảng lớn
3. **Storage tiết kiệm**: Bỏ cột `deleted` (1 byte/row) trên hàng triệu records
4. **Code rõ ràng hơn**: Biết entity nào cần soft delete, entity nào không

---

## Tổng kết

### Ưu điểm của Database-per-Tenant

1. **Bảo mật tối đa**: Data hoàn toàn tách biệt
2. **Dễ backup/restore**: Backup từng tenant độc lập
3. **Tuân thủ pháp luật**: Đáp ứng GDPR, data residency
4. **Hiệu suất ổn định**: Tenant lớn không ảnh hưởng tenant nhỏ
5. **Dễ scale**: Scale từng tenant độc lập

### Nhược điểm

1. **Chi phí cao hơn**: Nhiều database = nhiều resources
2. **Phức tạp hơn**: Cần quản lý nhiều database
3. **Migration khó hơn**: Phải migrate từng tenant

### Khi nào nên dùng?

- Khách hàng yêu cầu data isolation
- Tuân thủ quy định pháp luật nghiêm ngặt
- Khách hàng enterprise với data nhạy cảm
- Cần khả năng scale từng tenant độc lập
