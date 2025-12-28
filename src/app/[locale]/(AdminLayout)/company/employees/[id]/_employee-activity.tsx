import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function EmployeeActivity({ employeeId }: { employeeId: number }) {
  // TODO: Sử dụng employeeId để fetch hoạt động của nhân viên
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Chức năng đang cập nhật</p>
      </CardContent>
    </Card>
  );
}
