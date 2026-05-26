import { useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { vitasQueryOptions, useCreateVita } from '@/shared/data/local';

export const Route = createFileRoute('/editor/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(vitasQueryOptions()),
  component: EditorIndex,
});

function EditorIndex() {
  const navigate = useNavigate();
  const { data: vitas } = useSuspenseQuery(vitasQueryOptions());
  const createVita = useCreateVita();

  const ranRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ranRef.current) return;

    const list = Array.isArray(vitas) ? vitas : vitas ? [vitas] : [];
    const existing = list[0];

    if (existing?.id != null) {
      ranRef.current = true;
      navigate({ to: '/editor/$vitaId', params: { vitaId: existing.id }, replace: true });
      return;
    }

    ranRef.current = true;
    void (async () => {
      try {
        const newVita = await createVita.mutateAsync({
          name: 'Untitled',
          scope: 'private',
          type: 'DYNAMIC',
        });
        if (!newVita?.id) {
          setError('Failed to create a new vita.');
          ranRef.current = false;
          return;
        }
        navigate({ to: '/editor/$vitaId', params: { vitaId: newVita.id }, replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create a new vita.');
        ranRef.current = false;
      }
    })();
  }, [vitas, navigate, createVita]);

  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-secondary">
      {error ?? 'Loading editor…'}
    </div>
  );
}
