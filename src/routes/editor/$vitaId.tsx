import { createFileRoute } from '@tanstack/react-router';
import {
  vitaByIdQueryOptions,
  chroniclesByVitaIdQueryOptions,
  shardsByVitaIdQueryOptions,
} from '@/shared/data/local';
import EditorWorkspace from '@/components/features/editor/EditorWorkspace';

export const Route = createFileRoute('/editor/$vitaId')({
  parseParams: ({ vitaId }) => ({ vitaId: Number(vitaId) }),
  loader: ({ context: { queryClient }, params: { vitaId } }) =>
    Promise.all([
      queryClient.ensureQueryData(vitaByIdQueryOptions(vitaId)),
      queryClient.ensureQueryData(chroniclesByVitaIdQueryOptions(vitaId)),
      queryClient.ensureQueryData(shardsByVitaIdQueryOptions(vitaId)),
    ]),
  component: EditorVita,
});

function EditorVita() {
  const { vitaId } = Route.useParams();
  if (!Number.isFinite(vitaId)) {
    return <div className="p-4 text-xs text-red-400">Invalid vita id.</div>;
  }
  return <EditorWorkspace vitaId={vitaId} />;
}
