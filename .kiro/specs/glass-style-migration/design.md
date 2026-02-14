# Design Document: Glass Style Migration

## Overview

Chuyển đổi tất cả shadcn Card components sang glass-style components (GlassCard, GlassSection) trong dự án tama-hr để đồng nhất iOS Liquid Glass design system. Quá trình migration bao gồm việc thay đổi imports, cập nhật JSX structure, và bố trí lại bố cục nếu cần.

## Architecture

### Hiện trạng

```
@/components/ui/card
├── Card
├── CardHeader
├── CardTitle
├── CardDescription
├── CardContent
├── CardFooter
└── CardAction
```

### Mục tiêu

```
@/app/[locale]/_components/_glass-style
├── GlassCard (thay Card đơn giản, interactive)
├── GlassSection (thay Card với title/description)
├── GlassTable (thay Table trong Card)
├── GlassNav (thay navigation Card)
└── GlassTabs (thay Tabs)
```

### Quy tắc chuyển đổi

| Pattern hiện tại                   | Chuyển sang                     | Điều kiện               |
| ---------------------------------- | ------------------------------- | ----------------------- |
| Card + CardHeader + CardTitle      | GlassSection với title prop     | Form sections, settings |
| Card + CardContent only            | GlassCard                       | Cards đơn giản          |
| Card với onClick                   | GlassCard variant="interactive" | Interactive cards       |
| Card hiển thị data/stats           | GlassCard                       | Statistics, info cards  |
| CardTitle/CardDescription riêng lẻ | Heading elements                | Auth pages              |

## Components and Interfaces

### GlassCard API

```typescript
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "highlighted" | "interactive";
  onClick?: () => void;
}
```

### GlassSection API

```typescript
interface GlassSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}
```

### Conversion Patterns

#### Pattern 1: Card với CardHeader + CardTitle → GlassSection

**Trước:**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>{t("title")}</CardTitle>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
</Card>;
```

**Sau:**

```tsx
import { GlassSection } from "@/app/[locale]/_components/_glass-style";

<GlassSection title={t("title")}>
  {/* content - không cần wrapper div vì GlassSection đã có padding */}
</GlassSection>;
```

#### Pattern 2: Card chỉ có CardContent → GlassCard

**Trước:**

```tsx
import { Card, CardContent } from "@/components/ui/card";

<Card>
  <CardContent>{/* content */}</CardContent>
</Card>;
```

**Sau:**

```tsx
import { GlassCard } from "@/app/[locale]/_components/_glass-style";

<GlassCard className="p-6">{/* content */}</GlassCard>;
```

#### Pattern 3: Card với onClick → GlassCard interactive

**Trước:**

```tsx
<Card
  className="cursor-pointer hover:shadow-md"
  onClick={() => router.push(href)}
>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>{description}</CardContent>
</Card>
```

**Sau:**

```tsx
<GlassCard
  variant="interactive"
  onClick={() => router.push(href)}
  className="p-6"
>
  <h3 className="text-lg font-semibold mb-2">{title}</h3>
  <p className="text-sm text-muted-foreground">{description}</p>
</GlassCard>
```

#### Pattern 4: CardTitle/CardDescription riêng lẻ (Auth pages)

**Trước:**

```tsx
import { CardTitle, CardDescription } from "@/components/ui/card";

<CardTitle className="text-2xl">{t("title")}</CardTitle>
<CardDescription>{t("description")}</CardDescription>
```

**Sau:**

```tsx
<h1 className="text-2xl font-semibold">{t("title")}</h1>
<p className="text-muted-foreground">{t("description")}</p>
```

## Data Models

Không có thay đổi data models - đây là migration UI components.

## Danh sách files cần chuyển đổi

### Dialog Styling (Cập nhật component gốc)

Thay vì tạo GlassDialog mới, sẽ cập nhật `@/components/ui/dialog.tsx` để áp dụng glass styling cho DialogContent:

**Trước:**

```tsx
className={cn(
  "bg-background data-[state=open]:animate-in ...",
  className,
)}
```

**Sau:**

```tsx
className={cn(
  // Glass styling
  "backdrop-blur-xl",
  "bg-white/70 dark:bg-white/10",
  "border border-gray-200/80 dark:border-white/20",
  "shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20",
  // Animation và positioning giữ nguyên
  "data-[state=open]:animate-in ...",
  className,
)}
```

### DashboardLayout (dashboard/) - 30+ files

1. `dashboard/wallet/_transaction-chart.tsx` - Card → GlassCard
2. `dashboard/plans/_plan-history-table.tsx` - Card → GlassSection
3. `dashboard/support/_support-wallet-card.tsx` - Card → GlassSection
4. `dashboard/support/_company-search.tsx` - Card → GlassCard
5. `dashboard/shifts/_shifts-tabs.tsx` - Card → GlassCard
6. `dashboard/shifts/_shift-dashboard.tsx` - Card → GlassSection
7. `dashboard/shifts/templates/_shift-template-list.tsx` - Card → GlassCard
8. `dashboard/shifts/swaps/_swap-request-list.tsx` - Card → GlassCard
9. `dashboard/shifts/assignments/_shift-assignment-list.tsx` - Card → GlassCard
10. `dashboard/settings/_overtime-preview.tsx` - Card → GlassSection
11. `dashboard/reports/_report-type-cards.tsx` - Card → GlassCard interactive
12. `dashboard/reports/_report-generator.tsx` - Card → GlassSection
13. `dashboard/reports/payroll-summary/_payroll-summary-report-content.tsx` - Card → GlassSection
14. `dashboard/reports/shift-utilization/_shift-utilization-report-content.tsx` - Card → GlassSection
15. `dashboard/reports/payroll/_payroll-report-content.tsx` - Card → GlassSection
16. `dashboard/reports/overtime/_overtime-report-content.tsx` - Card → GlassSection
17. `dashboard/reports/break-compliance/_break-compliance-report-content.tsx` - Card → GlassSection
18. `dashboard/reports/cost-analysis/_cost-analysis-report-content.tsx` - Card → GlassSection
19. `dashboard/reports/break/_break-report-content.tsx` - Card → GlassSection
20. `dashboard/reports/attendance/_attendance-report-content.tsx` - Card → GlassSection
21. `dashboard/payslip/_page-content.tsx` - Card → GlassSection
22. `dashboard/payroll/_payroll-period-detail.tsx` - Card → GlassCard
23. `dashboard/payroll/_payroll-dashboard.tsx` - Card → GlassCard
24. `dashboard/payroll/[period]/_page-content.tsx` - Card → GlassCard
25. `dashboard/adjustments/_adjustment-detail.tsx` - Card → GlassSection
26. `dashboard/employees/[id]/_personal-info-tab/_emergency-contact-card.tsx` - Card → GlassSection
27. `dashboard/employees/[id]/_documents-tab/_documents-content.tsx` - Card → GlassCard
28. `dashboard/employees/[id]/_personal-info-tab/_section-sidebar.tsx` - Card → GlassNav
29. `dashboard/employees/[id]/_personal-info-tab/_work-info-card.tsx` - Card → GlassSection
30. `dashboard/employees/[id]/_personal-info-tab/_contact-info-card.tsx` - Card → GlassSection
31. `dashboard/employees/[id]/_referrals-tab/_referral-header.tsx` - Card → GlassSection
32. `dashboard/employees/[id]/_referrals-tab/_company-detail-dialog.tsx` - Card → GlassSection
33. `dashboard/employees/[id]/_salary-tab/_salary-config-content.tsx` - Card → GlassSection
34. `dashboard/employees/[id]/attendance/_employee-attendance-content.tsx` - Card → GlassSection

### TamabeeLayout (admin/) - 4 files

1. `admin/schedulers/_page-content.tsx` - Card → GlassCard
2. `admin/plans/_plan-feature-form.tsx` - Card → GlassCard
3. `admin/plans/_plan-card.tsx` - Card → GlassCard (complex, có CardFooter)
4. `admin/billing/_billing-content.tsx` - Card → GlassSection

### Shared Components (\_components/) - 5 files

1. `_components/_shared/payroll/payslip-card.tsx` - Card → GlassCard
2. `_components/_shared/attendance/_attendance-day-detail.tsx` - Card → GlassCard
3. `_components/_base/base-user-profile-form.tsx` - Card → GlassSection
4. `_components/_base/base-create-user-form.tsx` - Card → GlassSection
5. `_components/company/_company-detail-card.tsx` - Card → GlassCard

### Auth Pages (NotFooter) - 7 files

1. `register/_step-1.tsx` - CardTitle/CardDescription → heading elements
2. `register/_step-2.tsx` - Card + CardTitle/CardDescription → GlassCard + headings
3. `register/_step-3.tsx` - Card + CardTitle/CardDescription → GlassCard + headings
4. `register/_step-4.tsx` - CardTitle/CardDescription → heading elements
5. `login/_login-form.tsx` - Card → GlassCard
6. `forgot-password/ForgotPasswordForm.tsx` - CardTitle → heading element
7. `reset-password/ResetPasswordForm.tsx` - CardTitle → heading element

### Landing Page (HomeLayout) - 1 file

1. `_components/_landing-plan-card.tsx` - Card → GlassCard (complex, có CardFooter)

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: No Card imports after migration

_For all_ files that have been migrated, there should be no import statements from `@/components/ui/card`.

**Validates: Requirements 1.5, 2.3, 3.3, 4.3, 5.3, 6.1**

### Property 2: TypeScript compilation success

_For all_ migrated files, the TypeScript compiler should report no errors when running `npx tsc --noEmit`.

**Validates: Requirements 1.6, 2.4, 3.4, 4.4, 5.4, 6.2**

## Error Handling

- Nếu file có cấu trúc Card phức tạp (CardFooter, CardAction), cần xử lý thủ công
- Nếu file sử dụng Card với custom className phức tạp, cần review và điều chỉnh
- Nếu TypeScript báo lỗi sau migration, cần fix trước khi tiếp tục

## Testing Strategy

### Verification Steps

1. **Grep Search**: Sau mỗi batch migration, chạy grep search để verify không còn import từ `@/components/ui/card`
2. **TypeScript Check**: Chạy `npx tsc --noEmit` để verify không có lỗi
3. **Visual Review**: Review UI trên browser để đảm bảo glass-style được áp dụng đúng

### Verification Commands

```bash
# Kiểm tra còn import Card không
grep -r "from \"@/components/ui/card\"" src/app/[locale]/(DashboardLayout)
grep -r "from \"@/components/ui/card\"" src/app/[locale]/(TamabeeLayout)
grep -r "from \"@/components/ui/card\"" src/app/[locale]/(NotFooter)
grep -r "from \"@/components/ui/card\"" src/app/[locale]/(HomeLayout)
grep -r "from \"@/components/ui/card\"" src/app/[locale]/_components

# Kiểm tra TypeScript
npx tsc --noEmit 2>&1
```

### Unit Tests

Do đây là migration UI components, không cần viết unit tests mới. Verification được thực hiện qua:

- Grep search để verify imports
- TypeScript compiler để verify type safety
- Visual review để verify UI
