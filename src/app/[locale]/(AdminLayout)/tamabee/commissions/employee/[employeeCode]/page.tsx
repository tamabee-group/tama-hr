import { EmployeeCommissionDetailContent } from "./_page-content";

interface PageProps {
  params: Promise<{ employeeCode: string }>;
}

/**
 * Trang chi tiết hoa hồng theo nhân viên
 * Hiển thị danh sách công ty mà nhân viên đó giới thiệu
 */
export default async function EmployeeCommissionDetailPage({
  params,
}: PageProps) {
  const { employeeCode } = await params;
  return <EmployeeCommissionDetailContent employeeCode={employeeCode} />;
}
