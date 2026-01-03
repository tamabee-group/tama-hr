import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export async function HeroSection() {
  const locale = await getLocale();
  const t = await getTranslations("landing.hero");

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-cyan-50/30 dark:from-[#0f0f1a] dark:via-[#1a1a2e] dark:to-[#1a1a2e]" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,177,206,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,177,206,0.04)_1px,transparent_1px)] bg-size-[60px_60px]" />

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-8">
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
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Features list */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{t("feature1")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span>{t("feature2")}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
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
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  50+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("statsCompanies")}
                </div>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  1000+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("statsEmployees")}
                </div>
              </div>
              <div className="w-[2px] bg-gray-200 dark:bg-gray-700" />
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  99.9%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t("statsUptime")}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Image */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-linear-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-60" />

            {/* Image container */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl bg-white dark:bg-gray-900">
              <Image
                src="/images/hero.jpg"
                alt="Tamabee HR Dashboard"
                width={700}
                height={500}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Floating card - top right */}
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
