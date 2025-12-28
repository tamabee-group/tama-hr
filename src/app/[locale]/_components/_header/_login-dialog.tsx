"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Mail, Lock } from "lucide-react";
import { login } from "@/lib/apis/auth";
import { useAuth, fetchCurrentUser } from "@/lib/auth";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: () => void;
}

/**
 * Dialog đăng nhập - hiển thị form login trong modal
 * @client-only - Chỉ sử dụng được ở client side
 */
export function LoginDialog({
  open,
  onOpenChange,
  onLoginSuccess,
}: LoginDialogProps) {
  const router = useRouter();
  const { login: setAuthUser } = useAuth();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API login
      await login(formData.identifier, formData.password);

      // Gọi API /me để lấy thông tin user đầy đủ
      const user = await fetchCurrentUser();

      // Lưu user vào context và localStorage
      setAuthUser(user);

      toast.success("Đăng nhập thành công!");
      onOpenChange(false);
      onLoginSuccess?.();
      router.push("/");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form khi đóng dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData({ identifier: "", password: "" });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Đăng nhập</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="dialog-identifier">Email hoặc mã nhân viên</Label>
            <InputGroup>
              <InputGroupInput
                id="dialog-identifier"
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                placeholder="Nhập email hoặc mã nhân viên..."
                autoComplete="off"
                required
              />
              <InputGroupAddon>
                <Mail className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div>
            <Label htmlFor="dialog-password">Mật khẩu</Label>
            <InputGroup>
              <InputGroupInput
                id="dialog-password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Nhập mật khẩu..."
                autoComplete="off"
                required
              />
              <InputGroupAddon>
                <Lock className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>
            <div className="flex justify-end mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
                onClick={() => onOpenChange(false)}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <div className="text-center text-sm">
            Bạn chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary dark:text-(--blue-light) hover:underline font-medium"
              onClick={() => onOpenChange(false)}
            >
              Đăng ký
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
