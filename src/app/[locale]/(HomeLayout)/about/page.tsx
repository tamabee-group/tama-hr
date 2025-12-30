import { NextPage } from "next";
import { useTranslations } from "next-intl";

const AboutPage: NextPage = () => {
  const t = useTranslations("landing.about");

  return (
    <div className="container mx-auto py-16">
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
};

export default AboutPage;
