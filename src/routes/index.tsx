import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'Geist Sans, system-ui, sans-serif' }}>
      <h1>Hello Vita — Phase 4A POC</h1>
      <p>Vite + TanStack Router läuft auf :5173. Next bleibt unangetastet auf :3000.</p>
    </main>
  );
}
