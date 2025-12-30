import { useTranslations } from "next-intl";
import { ToggleTheme } from "../_components/_toggle-theme";
import { PricingSection } from "./_components/_pricing-section";

const LandingPage = () => {
  const t = useTranslations("company");
  return (
    <div>
      <h1>Content</h1>
      <ToggleTheme />
      <h2>{t("name")}</h2>

      {/* Pricing Section - Hiển thị các gói dịch vụ */}
      <PricingSection />
    </div>
  );
};

export default LandingPage;
