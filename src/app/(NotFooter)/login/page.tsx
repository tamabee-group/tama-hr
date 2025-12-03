"use client";

import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Call login API
    console.log("Login:", formData);
    setLoading(false);
  };

  return (
    <div className="w-full min-h-[calc(100vh-50px)] flex justify-center py-16">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        </div>
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Email hoặc mã nhân viên</Label>
              <InputGroup>
                <InputGroupInput
                  id="identifier"
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
              <Label htmlFor="password">Mật khẩu</Label>
              <InputGroup>
                <InputGroupInput
                  id="password"
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
                className="text-primary hover:underline font-medium"
              >
                Đăng ký
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
