"use client";

import { useCallback, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/**
 * Hook xử lý highlight item từ notification click
 * - Đọc query param `id` từ URL
 * - Trả về highlightId và callback để clear URL sau khi đã mở dialog
 * - KHÔNG track hasHandled - để component tự quản lý việc đã xử lý hay chưa
 */
export function useNotificationHighlight() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const highlightIdParam = searchParams.get("id");

  // Dùng ref để tránh re-create callback
  const pathnameRef = useRef(pathname);
  const highlightIdParamRef = useRef(highlightIdParam);

  // Sync refs in effect to avoid "cannot update ref during render"
  useEffect(() => {
    pathnameRef.current = pathname;
    highlightIdParamRef.current = highlightIdParam;
  });

  // Parse highlightId
  const highlightId = highlightIdParam ? Number(highlightIdParam) : null;

  // Callback ổn định - clear URL param sau khi đã mở dialog
  const onHighlightHandled = useCallback(() => {
    if (highlightIdParamRef.current) {
      router.replace(pathnameRef.current, { scroll: false });
    }
  }, [router]);

  return {
    highlightId,
    onHighlightHandled,
    hasHighlight: highlightId !== null,
  };
}
