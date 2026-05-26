import { createFileRoute, Outlet } from '@tanstack/react-router';
import { EditorFeatureProvider } from '@/components/features/editor/EditorFeatureContext';
import EditorFeatureManager from '@/components/features/editor/EditorFeatureManager';
import { ChronicleDetailProvider } from '@/components/features/editor/ChronicleDetailContext';
import ChronicleDetailPanel from '@/components/features/editor/ChronicleDetailPanel';
import EditorToolbar from '@/components/features/editor/EditorToolbar';

export const Route = createFileRoute('/editor')({
  component: EditorLayout,
});

function EditorLayout() {
  return (
    <EditorFeatureProvider>
      <ChronicleDetailProvider>
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <EditorFeatureManager />
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%' }}>
            <EditorToolbar />
            <div style={{ flex: 1, minHeight: 0 }}>
              <Outlet />
            </div>
          </div>
          <ChronicleDetailPanel />
        </div>
      </ChronicleDetailProvider>
    </EditorFeatureProvider>
  );
}
