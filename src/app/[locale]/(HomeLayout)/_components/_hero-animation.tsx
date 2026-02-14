"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Hero animation component cho landing page
 * Dùng DotLottieReact để render file .lottie
 */
export function HeroAnimation() {
  return (
    <DotLottieReact
      src="/animations/landing_animation.lottie"
      loop
      autoplay
      renderConfig={{
        devicePixelRatio: 3,
      }}
      className="w-full md:w-[500px] md:py-10 lg:w-[700px] h-auto relative md:right-30"
    />
  );
}
