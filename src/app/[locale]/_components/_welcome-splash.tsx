"use client";

import { useState, useEffect, useCallback } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const SPLASH_KEY = "tamabee_splash_shown";
const SPLASH_DURATION = 3000; // 2 giây

/**
 * Welcome splash animation — hiển thị 1 lần khi:
 * - Lần đầu mở app trong ngày (so sánh ngày trong localStorage)
 * - Đóng trình duyệt rồi mở lại (sessionStorage bị xóa)
 *
 * Dùng sessionStorage để track "đã xem trong session này",
 * và localStorage để track ngày cuối cùng đã xem.
 */
export function WelcomeSplash() {
  // Luôn bắt đầu false để server/client khớp nhau (tránh hydration mismatch)
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Chỉ chạy trên client: kiểm tra có nên hiện splash không
  useEffect(() => {
    // Nếu đã xem trong session này → skip
    if (sessionStorage.getItem(SPLASH_KEY)) return;

    // Đánh dấu đã xem
    const today = new Date().toDateString();
    sessionStorage.setItem(SPLASH_KEY, "1");
    localStorage.setItem(SPLASH_KEY, today);
    setVisible(true); // eslint-disable-line react-hooks/set-state-in-effect

    // Bắt đầu fade out trước khi ẩn
    const fadeTimer = setTimeout(() => setFadeOut(true), SPLASH_DURATION - 500);
    const hideTimer = setTimeout(() => setVisible(false), SPLASH_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSkip = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => setVisible(false), 100);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Escape" && handleSkip()}
      aria-label="Skip welcome animation"
    >
      <div className="w-80 h-80 sm:w-96 sm:h-96">
        <DotLottieReact
          src="/animations/wellcome_animation.lottie"
          autoplay
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
