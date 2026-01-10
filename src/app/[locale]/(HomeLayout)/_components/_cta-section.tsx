import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { PublicSettings } from "@/lib/apis/plan-api";

interface CtaSectionProps {
  settings: PublicSettings;
}

export async function CtaSection({ settings }: CtaSectionProps) {
  const locale = await getLocale();
  const t = await getTranslations("landing.cta");

  return (
    <section className="pb-20 relative z-10 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary dark:bg-transparent border border-primary p-8 md:p-12 text-center text-white">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("title")}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              {t("description", { months: settings.freeTrialMonths })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 px-8"
                asChild
              >
                <Link href={`/${locale}/register`}>
                  {t("button")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
