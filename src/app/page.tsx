"use client";

import HeroSection from "@/components/landing/HeroSection";
import StatsStripSection from "@/components/landing/StatsStripSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection/HowItWorksSection";
import UseCasesSection from "@/components/landing/UseCasesSection";
import CtaFooterSection from "@/components/landing/CtaFooterSection";

const Home = () => {
  return (
    <div className="landing h-full flex flex-col bg-[var(--l-bg)] text-[var(--l-fg)]">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <HeroSection />
        <StatsStripSection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <CtaFooterSection />
      </div>
    </div>
  );
};

export default Home;
