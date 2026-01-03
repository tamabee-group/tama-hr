import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

export async function WhySection() {
  const t = await getTranslations("landing.why");

  const benefits = [
    "benefit1",
    "benefit2",
    "benefit3",
    "benefit4",
    "benefit5",
    "benefit6",
  ];

  return (
    <section className="py-20 bg-muted/50 relative z-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {t("badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              {t("title")}
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {t("description")}
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((key) => (
                <div key={key} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2">80%</div>
              <div className="text-sm text-muted-foreground">{t("stat1")}</div>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2">50%</div>
              <div className="text-sm text-muted-foreground">{t("stat2")}</div>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">{t("stat3")}</div>
            </div>
            <div className="bg-background rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <div className="text-sm text-muted-foreground">{t("stat4")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
