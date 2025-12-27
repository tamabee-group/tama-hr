import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UserActivity({ userId }: { userId: number }) {
  // TODO: Sử dụng userId để fetch hoạt động của user
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
