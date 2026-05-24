"use client";

import HeroSection from "@/components/features/dashboard/sections/HeroSection";
import VitasSection from "@/components/features/dashboard/sections/VitasSection";
import ChroniclesSection from "@/components/features/dashboard/sections/ChroniclesSection";

const DashboardPage = () => {
  return (
    <>
      <HeroSection />
      <VitasSection />
      <ChroniclesSection />
    </>
  );
};

export default DashboardPage;
