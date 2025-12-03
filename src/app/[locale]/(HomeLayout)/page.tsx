import { useTranslations } from "next-intl";
import { ToggleTheme } from "../_components/ToggleTheme";

const LandingPage = () => {
  const t = useTranslations("company");
  return (
    <div>
      <h1>Content</h1>
      <ToggleTheme />
      <h2>{t("name")}</h2>
    </div>
  );
};

export default LandingPage;
