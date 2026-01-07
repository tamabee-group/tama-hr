import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  Clock,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Wallet,
  CalendarDays,
  ClipboardList,
  Settings,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";

const mainFeatures = [
  { key: "checkTime", image: "/images/check-time.webp", icon: Clock },
  {
    key: "shiftManagement",
    image: "/images/shift-management.webp",
    icon: Calendar,
  },
  { key: "contracts", image: "/images/contracts.webp", icon: FileText },
  { key: "analytics", image: "/images/analytics.webp", icon: BarChart3 },
];

const additionalFeatures = [
  { key: "employees", icon: Users },
  { key: "wallet", icon: Wallet },
  { key: "holidays", icon: CalendarDays },
  { key: "leave", icon: ClipboardList },
  { key: "settings", icon: Settings },
  { key: "security", icon: Shield },
  { key: "mobile", icon: Smartphone },
  { key: "multiLanguage", icon: Globe },
];

export async function FeaturesSection() {
  const t = await getTranslations("landing.features");

  return (
    <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Features - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {mainFeatures.map((feature) => (
            <div key={feature.key} className="glow-card group">
              <div className="p-6 h-full">
                <div className="flex gap-6">
                  {/* Image */}
                  <Image
                    src={feature.image}
                    alt={t(`${feature.key}Title`)}
                    width={120}
                    height={120}
                    className="object-cover aspect-square rounded-md border border-primary group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                      {t(`${feature.key}Title`)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t(`${feature.key}Desc`)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features - Compact Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {additionalFeatures.map((feature) => (
            <div
              key={feature.key}
              className="group bg-white dark:bg-gray-800 rounded-xl p-5 text-center hover:shadow-md transition-shadow"
            >
              <feature.icon className="w-full h-6 mb-2 text-primary text-center flex" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                {t(`${feature.key}Title`)}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(`${feature.key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
