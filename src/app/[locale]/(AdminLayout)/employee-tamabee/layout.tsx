import { EmployeeLayoutContent } from "./_components/_employee-layout-content";

/**
 * Layout cho Employee Tamabee (Server Component)
 * - Delegate auth logic và rendering cho EmployeeLayoutContent (Client Component)
 * @server-only
 */
export default function EmployeeTamabeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployeeLayoutContent>{children}</EmployeeLayoutContent>;
}
