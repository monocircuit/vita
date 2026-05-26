import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { chroniclesQueryOptions } from '@/shared/data/local';
import ChronicleCreateForm from '@/components/forms/domains/chronicle/create';
import { Popover } from '@monocircuit/monolithium/components';
import { useState } from 'react';
import PageHead from '@/components/features/dashboard/sections/PageHead';
import {
  mono,
  sans,
  pad2,
  formatDateStamp,
  relativeTime,
  toTimestamp,
} from '@/components/features/dashboard/sections/utils';

const ScopePill = ({ scope }: { scope: string }) => {
  const isPersonal = scope.toLowerCase() === 'personal';
  return (
    <span
      style={{
        ...mono,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.25em',
        padding: '3px 7px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: isPersonal ? 'rgba(255,209,0,0.08)' : 'transparent',
        color: isPersonal ? 'var(--color-accent)' : '#8a8a8a',
      }}
    >
      {scope}
    </span>
  );
};

export const Route = createFileRoute('/dashboard/chronicles')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(chroniclesQueryOptions()),
  component: Chronicles,
});

function Chronicles() {
  const { data: chronicles } = useSuspenseQuery(chroniclesQueryOptions());
  const [isAddOpen, setIsAddOpen] = useState(false);

  const list = (chronicles ?? [])
    .slice()
    .sort((a, b) => (toTimestamp(b.createdAt) ?? 0) - (toTimestamp(a.createdAt) ?? 0));

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100%' }}>
      <PageHead
        number="02"
        kicker="SECTION · CHRONICLES"
        title="Every event, every entity."
        subtitle="Chronicles are the atomic entries in your vitas — places, moves, jobs, relationships. Sorted newest first."
        right={
          <div className="flex flex-col items-end gap-1">
            <div style={{ ...mono, fontSize: 22, fontWeight: 700, color: 'var(--color-fg)' }}>
              {pad2(list.length)}
            </div>
            <div
              style={{
                ...mono,
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.25em',
                color: '#606060',
              }}
            >
              Chronicles · Total
            </div>
          </div>
        }
      />

      <div style={{ padding: '32px max(32px,5%) 24px' }}>
        <Popover
          content={<ChronicleCreateForm />}
          className="w-75 h-125 border-solid border-secondary border-(length:--stroke) bg-primary [&>div:last-child]:overflow-visible!"
          config={{ isConnected: true, isClosableByEmptyClick: true, isDraggable: true }}
          shouldRender={isAddOpen}
        >
          <button
            onClick={() => setIsAddOpen(v => !v)}
            style={{
              ...mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '10px 18px',
              background: 'var(--color-accent)',
              color: '#0a0a0a',
            }}
          >
            + New Chronicle
          </button>
        </Popover>
      </div>

      <div style={{ padding: '0 max(32px,5%) 48px' }}>
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: 'auto 1fr auto auto auto',
            gap: 16,
            padding: '10px 4px',
            borderBottom: '1px solid rgba(255,255,255,0.14)',
            ...mono,
            fontSize: 9,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#606060',
          }}
        >
          <span style={{ minWidth: 82 }}>Date</span>
          <span>Title</span>
          <span>Category</span>
          <span>Scope</span>
          <span>Edited</span>
        </div>

        {list.length === 0 ? (
          <div style={{ ...sans, color: '#8a8a8a', padding: '24px 4px' }}>
            No chronicles yet.
          </div>
        ) : (
          list.map(c => (
            <div
              key={c.id}
              className="grid items-center group cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: 16,
                padding: '14px 4px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')
              }
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ ...mono, fontSize: 11, color: '#b8b8b8', minWidth: 82 }}>
                {formatDateStamp(c.createdAt)}
              </div>
              <div
                style={{
                  ...sans,
                  fontSize: 15,
                  fontWeight: 400,
                  color: 'var(--color-fg)',
                }}
                className="truncate"
              >
                {c.title}
              </div>
              <div>
                {c.category ? (
                  <span
                    style={{
                      ...mono,
                      fontSize: 9,
                      padding: '3px 7px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#8a8a8a',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                    }}
                  >
                    {c.category}
                  </span>
                ) : (
                  <span style={{ ...mono, fontSize: 10, color: '#606060' }}>—</span>
                )}
              </div>
              <ScopePill scope={c.scope} />
              <div
                style={{
                  ...mono,
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: '#606060',
                  minWidth: 70,
                  textAlign: 'right',
                }}
              >
                {relativeTime(c.updatedAt ?? c.createdAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
