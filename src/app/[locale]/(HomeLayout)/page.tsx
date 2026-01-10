import { apiServer } from "@/lib/utils/fetch-server";
import { getPublicSettingsServer } from "@/lib/apis/plan-api";
import { HeroSection } from "./_components/_hero-section";
import { FeaturesSection } from "./_components/_features-section";
import { WhySection } from "./_components/_why-section";
import { PricingSection } from "./_components/_pricing-section";
import { CtaSection } from "./_components/_cta-section";

const LandingPage = async () => {
  const settings = await getPublicSettingsServer(apiServer);

  return (
    <div>
      <HeroSection settings={settings} />
      <FeaturesSection />
      <WhySection />
      <PricingSection settings={settings} />
      <CtaSection settings={settings} />
    </div>
  );
};

export default LandingPage;
