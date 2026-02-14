"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { User } from "@/types/user";
import {
  saveCurrentUser,
  setHasSession,
  getCurrentUser,
  getHasSession,
} from "./storage";
import {
  validateSession,
  logout as logoutSession,
  fetchCurrentUser,
  SessionStatus,
} from "./session";
import { hasAccessToken } from "./token";
import { resetNotificationWebSocket } from "@/hooks/use-notifications";

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
 * User data bao gồm tenantDomain và planId được lấy từ API /me
 * (backend parse từ JWT và trả về trong response)
 * @client-only
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  // Fetch user từ API và cập nhật state
  const refreshUser = useCallback(async () => {
    try {
      const userData = await fetchCurrentUser();
      saveCurrentUser(userData);
      setUser(userData);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
      setHasSession(false);
      // Cleanup WebSocket khi session hết hạn
      resetNotificationWebSocket();
    }
  }, []);

  // Khởi tạo session khi mount
  useEffect(() => {
    const initSession = async () => {
      const result = await validateSession();
      setUser(result.user);
      setStatus(result.status);
    };
    initSession();
  }, []);

  // Sync session khi route thay đổi
  useEffect(() => {
    if (status === "loading") return;

    // Không sync nếu đã logout (status = unauthenticated)
    if (status === "unauthenticated") {
      prevPathRef.current = pathname;
      return;
    }

    // Bỏ qua lần đầu tiên
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }

    // Chỉ xử lý khi route thực sự thay đổi
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    const hasSession = getHasSession();
    const cachedUser = getCurrentUser();
    const hasToken = hasAccessToken();

    // Có session/token nhưng không có user → fetch user
    if ((hasSession || hasToken) && !user) {
      if (cachedUser) {
        // Sử dụng queueMicrotask để tránh setState trực tiếp trong effect
        queueMicrotask(() => {
          setUser(cachedUser);
          setStatus("authenticated");
        });
      } else {
        queueMicrotask(() => refreshUser());
      }
    }
  }, [pathname, status, user, refreshUser]);

  // Login: lưu user và set session flag
  const login = useCallback((userData: User) => {
    saveCurrentUser(userData);
    setHasSession(true);
    setUser(userData);
    setStatus("authenticated");
  }, []);

  // Logout: xóa session, cleanup WebSocket và gọi API
  const logout = useCallback(async () => {
    try {
      resetNotificationWebSocket();
      await logoutSession();
    } catch {
      // Bỏ qua lỗi, đảm bảo state vẫn được reset
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
