import { useTranslations } from "next-intl";
import { ToggleTheme } from "../_components/_toggle-theme";
import { PricingSection } from "./_components/_pricing-section";

const LandingPage = () => {
  const t = useTranslations("landing");

  return (
    <div>
      <h1>{t("content")}</h1>
      <ToggleTheme />

      <PricingSection />
    </div>
  );
};

export default LandingPage;
