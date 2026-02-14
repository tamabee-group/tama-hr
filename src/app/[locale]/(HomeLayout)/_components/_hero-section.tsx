import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FreeTrialBadge } from "./_free-trial-badge";
import { PublicSettings } from "@/lib/apis/plan-api";
import { HeroAnimation } from "./_hero-animation";

interface HeroSectionProps {
  settings: PublicSettings;
}

export async function HeroSection({ settings }: HeroSectionProps) {
  const locale = await getLocale();
  const t = await getTranslations("landing.hero");

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-50px)] overflow-hidden flex items-center"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-cyan-50/30 dark:from-[#0f0f1a] dark:via-[#1a1a2e] dark:to-[#1a1a2e]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,177,206,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,177,206,0.08)_1px,transparent_1px)] bg-size-[60px_60px]" />

      {/* Gradient orbs - ẩn trên mobile để tránh nhoè */}
      <div className="hidden md:block absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="hidden md:block absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Decorative elements - chỉ hiển thị trên màn hình lớn */}
      <div className="hidden xl:block absolute top-32 left-8 2xl:left-16">
        <div className="relative">
          <div className="w-16 h-16 2xl:w-20 2xl:h-20 rounded-2xl bg-linear-to-br from-primary/20 to-cyan-400/20 backdrop-blur-sm border border-primary/10 rotate-12 animate-float" />
          <div className="absolute -bottom-8 -left-4 w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-400/20 backdrop-blur-sm border border-purple-500/10 -rotate-12 animate-float-delayed" />
        </div>
      </div>

      <div className="hidden xl:block absolute bottom-40 right-8 2xl:right-16">
        <div className="relative">
          <div className="w-14 h-14 2xl:w-16 2xl:h-16 rounded-full bg-linear-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/10 animate-float-delayed" />
          <div className="absolute -top-6 -right-6 w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-linear-to-br from-yellow-400/20 to-orange-400/20 backdrop-blur-sm border border-yellow-400/10 rotate-45 animate-float" />
        </div>
      </div>

      {/* Decorative lines */}
      <div className="hidden xl:block absolute top-20 left-1/4 w-32 h-[2px] bg-linear-to-r from-transparent via-primary/30 to-transparent rotate-45" />
      <div className="hidden xl:block absolute top-40 right-1/4 w-24 h-[2px] bg-linear-to-r from-transparent via-purple-500/30 to-transparent -rotate-12" />

      {/* Decorative dots pattern */}
      <div className="hidden 2xl:grid absolute left-12 top-1/2 -translate-y-1/2 grid-cols-3 gap-3 opacity-40">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/40"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <div className="hidden 2xl:grid absolute right-12 top-1/3 grid-cols-3 gap-3 opacity-40">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-500/40"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>

      {/* Curved decorative lines */}
      <svg
        className="hidden xl:block absolute bottom-20 left-0 w-64 h-64 text-primary/10"
        viewBox="0 0 200 200"
        fill="none"
      >
        <path
          d="M0 100 Q 50 50, 100 100 T 200 100"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
      <svg
        className="hidden xl:block absolute top-10 right-0 w-48 h-48 text-purple-500/10"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="10 10"
        />
      </svg>

      {/* Animation - absolute bên phải, chỉ hiện từ lg trở đi */}
      {/* (bỏ absolute, dùng grid bên dưới) */}

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12">
        {/* Mobile + Tablet: animation hiển thị trên cùng, căn giữa */}
        <div className="md:hidden flex justify-center mb-8">
          <div className="w-80 sm:w-100">
            <HeroAnimation />
          </div>
        </div>

        <div className="md:grid md:grid-cols-5 md:gap-8 lg:gap-12 md:items-center">
          {/* Content - căn giữa trên mobile, trái từ md */}
          <div className="md:col-span-3 space-y-6 md:space-y-8 text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20 dark:border-(--blue)/50">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">
                {t("badge")}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              <span>{t("titleLine1")}</span>
              <span className="text-primary block">{t("titleHighlight")}</span>
              <span>{t("titleLine2")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Features list */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{t("feature1")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{t("feature2")}</span>
              </div>
            </div>

            {/* Free trial info */}
            <div className="flex justify-center md:justify-start">
              <FreeTrialBadge settings={settings} />
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Button
                size="lg"
                className="text-base px-8 bg-primary dark:bg-(--blue) hover:bg-primary/90 text-white font-medium rounded-full group"
                asChild
              >
                <Link href={`/${locale}/register`}>
                  {t("cta")}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 rounded-full"
                asChild
              >
                <Link href="#features">{t("learnMore")}</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 justify-center md:justify-start md:gap-8 pt-4">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  50+
                </div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {t("statsCompanies")}
                </div>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  1000+
                </div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {t("statsEmployees")}
                </div>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  99.9%
                </div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {t("statsUptime")}
                </div>
              </div>
            </div>
          </div>

          {/* Animation - chỉ hiện trong grid từ md trở đi */}
          <div className="hidden md:block md:col-span-2 relative right-10 mt-20 mb-10">
            <HeroAnimation />
            {/* Floating card */}
            <div className="absolute -top-8 -right-2 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t("cardTitle")}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t("cardSubtitle")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
