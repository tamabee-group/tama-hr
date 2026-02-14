# Implementation Plan: Glass Style Migration

## Overview

- Chuyển đổi tất cả shadcn Card components sang glass-style components trong dự án tama-hr. Thực hiện từng file một để đảm bảo chất lượng.
- Khi kiro thực hiện task hãy phản hồi tôi bằng tiếng việt.

## Tasks

- [x] 1. Cập nhật Dialog component với glass styling
  - [x] 1.1 Cập nhật `@/components/ui/dialog.tsx` với glass styling cho DialogContent
  - [x] 1.2 Verify TypeScript không có lỗi

- [x] 2. DashboardLayout - Reports
  - [x] 2.1 `dashboard/reports/_report-type-cards.tsx` → GlassCard interactive
  - [x] 2.2 `dashboard/reports/_report-generator.tsx` → GlassSection
  - [x] 2.3 `dashboard/reports/attendance/_attendance-report-content.tsx` → GlassSection
  - [x] 2.4 `dashboard/reports/overtime/_overtime-report-content.tsx` → GlassSection
  - [x] 2.5 `dashboard/reports/break/_break-report-content.tsx` → GlassSection
  - [x] 2.6 `dashboard/reports/break-compliance/_break-compliance-report-content.tsx` → GlassSection
  - [x] 2.7 `dashboard/reports/payroll/_payroll-report-content.tsx` → GlassSection
  - [x] 2.8 `dashboard/reports/payroll-summary/_payroll-summary-report-content.tsx` → GlassSection
  - [x] 2.9 `dashboard/reports/cost-analysis/_cost-analysis-report-content.tsx` → GlassSection
  - [x] 2.10 `dashboard/reports/shift-utilization/_shift-utilization-report-content.tsx` → GlassSection

- [x] 3. DashboardLayout - Shifts
  - [x] 3.1 `dashboard/shifts/_shift-dashboard.tsx` → GlassSection
  - [x] 3.2 `dashboard/shifts/_shifts-tabs.tsx` → GlassCard
  - [x] 3.3 `dashboard/shifts/templates/_shift-template-list.tsx` → GlassCard
  - [x] 3.4 `dashboard/shifts/swaps/_swap-request-list.tsx` → GlassCard
  - [x] 3.5 `dashboard/shifts/assignments/_shift-assignment-list.tsx` → GlassCard

- [x] 4. DashboardLayout - Payroll
  - [x] 4.1 `dashboard/payroll/_payroll-dashboard.tsx` → GlassCard
  - [x] 4.2 `dashboard/payroll/_payroll-period-detail.tsx` → GlassCard
  - [x] 4.3 `dashboard/payroll/[period]/_page-content.tsx` → GlassCard
  - [x] 4.4 `dashboard/payslip/_page-content.tsx` → GlassSection

- [x] 5. DashboardLayout - Support, Wallet, Settings, Plans
  - [x] 5.1 `dashboard/support/_support-wallet-card.tsx` → GlassSection
  - [x] 5.2 `dashboard/support/_company-search.tsx` → GlassCard
  - [x] 5.3 `dashboard/wallet/_transaction-chart.tsx` → GlassCard
  - [x] 5.4 `dashboard/settings/_overtime-preview.tsx` → GlassSection
  - [x] 5.5 `dashboard/plans/_plan-history-table.tsx` → GlassSection
  - [x] 5.6 `dashboard/adjustments/_adjustment-detail.tsx` → GlassSection

- [x] 6. DashboardLayout - Employees
  - [x] 6.1 `dashboard/employees/[id]/_personal-info-tab/_section-sidebar.tsx` → GlassNav
  - [x] 6.2 `dashboard/employees/[id]/_personal-info-tab/_work-info-card.tsx` → GlassSection
  - [x] 6.3 `dashboard/employees/[id]/_personal-info-tab/_contact-info-card.tsx` → GlassSection
  - [x] 6.4 `dashboard/employees/[id]/_personal-info-tab/_emergency-contact-card.tsx` → GlassSection
  - [x] 6.5 `dashboard/employees/[id]/_documents-tab/_documents-content.tsx` → GlassCard
  - [x] 6.6 `dashboard/employees/[id]/_referrals-tab/_referral-header.tsx` → GlassSection
  - [x] 6.7 `dashboard/employees/[id]/_referrals-tab/_company-detail-dialog.tsx` → GlassSection
  - [x] 6.8 `dashboard/employees/[id]/_salary-tab/_salary-config-content.tsx` → GlassSection
  - [x] 6.9 `dashboard/employees/[id]/attendance/_employee-attendance-content.tsx` → GlassSection

- [x] 7. TamabeeLayout (admin/)
  - [x] 7.1 `admin/schedulers/_page-content.tsx` → GlassCard
  - [x] 7.2 `admin/plans/_plan-feature-form.tsx` → GlassCard
  - [x] 7.3 `admin/plans/_plan-card.tsx` → GlassCard (có CardFooter)
  - [x] 7.4 `admin/billing/_billing-content.tsx` → GlassSection

- [x] 8. Shared Components (\_components/)
  - [x] 8.1 `_components/_shared/payroll/payslip-card.tsx` → GlassCard
  - [x] 8.2 `_components/_shared/attendance/_attendance-day-detail.tsx` → GlassCard
  - [x] 8.3 `_components/_base/base-user-profile-form.tsx` → GlassSection
  - [x] 8.4 `_components/_base/base-create-user-form.tsx` → GlassSection
  - [x] 8.5 `_components/company/_company-detail-card.tsx` → GlassCard

- [x] 9. PersonalLayout (me/)
  - [x] 9.1 `me/schedule/_swap-request-form.tsx` → GlassSection
  - [x] 9.2 `me/adjustments/[date]/_page-content.tsx` → GlassSection
  - [x] 9.3 `me/adjustments/[date]/_adjustment-request-card.tsx` → GlassSection
  - [x] 9.4 `me/commissions/_page-content.tsx` → GlassSection
  - [x] 9.5 `me/attendance/_components/_attendance-calendar.tsx` → GlassSection
  - [x] 9.6 `me/attendance/[date]/_unified-attendance-card.tsx` → GlassSection
  - [x] 9.7 `me/attendance/[date]/_break-history.tsx` → GlassSection
  - [x] 9.8 `me/attendance/[date]/_break-timeline.tsx` → GlassSection
  - [x] 9.9 `me/attendance/[date]/_break-section.tsx` → GlassSection
  - [x] 9.10 `me/attendance/[date]/_attendance-history.tsx` → GlassSection

- [x] 10. Auth Pages (NotFooter)
  - [x] 10.1 `login/_login-form.tsx` → GlassCard + headings
  - [x] 10.2 `register/_step-1.tsx` → headings
  - [x] 10.3 `register/_step-2.tsx` → GlassCard + headings
  - [x] 10.4 `register/_step-3.tsx` → GlassCard + headings
  - [x] 10.5 `register/_step-4.tsx` → headings
  - [x] 10.6 `forgot-password/ForgotPasswordForm.tsx` → heading
  - [x] 10.7 `reset-password/ResetPasswordForm.tsx` → heading

- [x] 11. Landing Page (HomeLayout)
  - [x] 11.1 `_components/_landing-plan-card.tsx` → GlassCard (có CardFooter)

- [x] 12. Xác minh và dọn dẹp
  - [x] 12.1 Grep search verify không còn import từ `@/components/ui/card`
  - [x] 12.2 Chạy `npx tsc --noEmit` verify không có lỗi
  - [x] 12.3 Comment-out `@/components/ui/card.tsx`

## Conversion Patterns

### Card + CardHeader + CardTitle → GlassSection

```tsx
// Trước
<Card>
  <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
  <CardContent>{content}</CardContent>
</Card>

// Sau
<GlassSection title={title}>{content}</GlassSection>
```

### Card + CardContent only → GlassCard

```tsx
// Trước
<Card><CardContent>{content}</CardContent></Card>

// Sau
<GlassCard className="p-6">{content}</GlassCard>
```

### Card với onClick → GlassCard interactive

```tsx
// Trước
<Card onClick={handler} className="cursor-pointer">...</Card>

// Sau
<GlassCard variant="interactive" onClick={handler} className="p-6">...</GlassCard>
```

### CardTitle/CardDescription riêng lẻ → headings

```tsx
// Trước
<CardTitle>{title}</CardTitle>
<CardDescription>{desc}</CardDescription>

// Sau
<h1 className="text-2xl font-semibold">{title}</h1>
<p className="text-muted-foreground">{desc}</p>
```
