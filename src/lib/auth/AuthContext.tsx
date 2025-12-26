"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/types/user";
import { saveCurrentUser, setHasSession } from "./storage";
import {
  validateSession,
  logout as logoutSession,
  fetchCurrentUser,
  SessionStatus,
} from "./session";

export interface AuthContextType {
  user: User | null;
  status: SessionStatus;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider quản lý trạng thái xác thực của ứng dụng
 * @client-only - Chỉ sử dụng được ở client side
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  // Khởi tạo: kiểm tra và khôi phục phiên đăng nhập
  useEffect(() => {
    const initSession = async () => {
      const result = await validateSession();
      setUser(result.user);
      setStatus(result.status);
    };

    initSession();
  }, []);

  // Hàm login: lưu user vào state và localStorage, set session flag
  const login = useCallback((userData: User) => {
    saveCurrentUser(userData);
    setHasSession(true);
    setUser(userData);
    setStatus("authenticated");
  }, []);

  // Hàm logout: xóa user và gọi API logout
  const logout = useCallback(async () => {
    await logoutSession();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  // Hàm refresh: gọi lại API /me để cập nhật thông tin user
  const refreshUser = useCallback(async () => {
    try {
      const userData = await fetchCurrentUser();
      saveCurrentUser(userData);
      setUser(userData);
    } catch {
      // Nếu không lấy được user, có thể session đã hết hạn
      await logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
