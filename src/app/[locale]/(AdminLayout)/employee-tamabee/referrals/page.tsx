import { ReferralsPageContent } from "./_referrals-page-content";

/**
 * Trang danh sách công ty đã giới thiệu cho Employee Tamabee
 * Server Component - delegate rendering cho Client Component
 * @server-only
 */
export default function EmployeeReferralsPage() {
  return <ReferralsPageContent />;
}
