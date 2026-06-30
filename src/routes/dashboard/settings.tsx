import { createFileRoute } from '@tanstack/react-router';
import PageHead from '@/components/features/dashboard/sections/PageHead';
import BackupControls from '@/components/features/dashboard/sections/BackupControls';

export const Route = createFileRoute('/dashboard/settings')({
  component: Settings,
});

function Settings() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>
      <PageHead
        number="09"
        kicker="SECTION · SETTINGS"
        title="Settings."
        subtitle="Manage your local data and backups."
      />
      <BackupControls />
    </div>
  );
}
