import { createFileRoute, Outlet } from '@tanstack/react-router';
import DashboardLayout from '@/components/features/dashboard/DashboardLayout';

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
