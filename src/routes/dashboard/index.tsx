import { createFileRoute } from '@tanstack/react-router';
import HeroSection from '@/components/features/dashboard/sections/HeroSection';
import VitasSection from '@/components/features/dashboard/sections/VitasSection';
import ChroniclesSection from '@/components/features/dashboard/sections/ChroniclesSection';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
});

function DashboardHome() {
  return (
    <>
      <HeroSection />
      <VitasSection />
      <ChroniclesSection />
    </>
  );
}
