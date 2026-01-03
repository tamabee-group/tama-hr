import { HeroSection } from "./_components/_hero-section";
import { FeaturesSection } from "./_components/_features-section";
import { WhySection } from "./_components/_why-section";
import { PricingSection } from "./_components/_pricing-section";
import { CtaSection } from "./_components/_cta-section";

const LandingPage = () => {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <WhySection />
      <PricingSection />
      <CtaSection />
    </div>
  );
};

export default LandingPage;
