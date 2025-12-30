"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { PlanResponse } from "@/types/plan";
import { getActivePlans } from "@/lib/apis/plan-api";
import { SupportedLocale } from "@/lib/utils/format-currency";
import { LandingPlanCard } from "./_landing-plan-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Pricing Section cho Landing Page
 * - Hiển thị danh sách plans active dạng cards
 * - Responsive: 1 column mobile, 2 columns tablet, 3 columns desktop
 * - Nút "Đăng ký" navigate đến register với planId
 */
export function PricingSection() {
  const router = useRouter();
  const locale = useLocale() as SupportedLocale;
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Labels theo locale
  const labels: Record<
    SupportedLocale,
    { title: string; subtitle: string; error: string }
  > = {
    vi: {
      title: "Bảng giá",
      subtitle: "Chọn gói phù hợp với nhu cầu của bạn",
      error: "Không thể tải danh sách gói dịch vụ",
    },
    en: {
      title: "Pricing",
      subtitle: "Choose the plan that fits your needs",
      error: "Unable to load pricing plans",
    },
    ja: {
      title: "料金プラン",
      subtitle: "ニーズに合ったプランをお選びください",
      error: "料金プランを読み込めませんでした",
    },
  };

  const t = labels[locale] || labels.vi;

  // Fetch active plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getActivePlans();
        setPlans(data);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t.error]);

  // Handle select plan - navigate to register with planId
  const handleSelectPlan = (planId: number) => {
    router.push(`/${locale}/register?planId=${planId}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <section id="pricing" className="py-16">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-72 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-96 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="pricing" className="py-16">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
        </div>
      </section>
    );
  }

  // No plans available
  if (plans.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{t.title}</h2>
        <p className="text-muted-foreground text-lg">{t.subtitle}</p>
      </div>

      {/* Plan Cards Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <LandingPlanCard
            key={plan.id}
            plan={plan}
            locale={locale}
            onSelect={() => handleSelectPlan(plan.id)}
          />
        ))}
      </div>
    </section>
  );
}
