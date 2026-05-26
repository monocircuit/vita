import { createFileRoute } from '@tanstack/react-router';
import PageHead from '@/components/features/dashboard/sections/PageHead';
import { mono } from '@/components/features/dashboard/sections/utils';

export const Route = createFileRoute('/dashboard/settings')({
  component: Settings,
});

function Settings() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>
      <PageHead
        number="09"
        kicker="SECTION · SETTINGS"
        title="Account settings."
        subtitle="Manage your profile, preferences, and integrations."
      />
      <div
        style={{
          ...mono,
          fontSize: 11,
          color: '#606060',
          padding: '32px max(32px,5%) 48px',
        }}
      >
        Coming soon.
      </div>
    </div>
  );
}
