import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ZLayerProvider } from '@monocircuit/monolithium/contexts';
import { MuiThemeAdapter } from '@/shared/theme/MuiThemeAdapter';
import AppChrome from '@/components/layout/AppChrome';
import { UpdateToast } from '@/features/updates/UpdateToast';

export interface RootRouteContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <MuiThemeAdapter>
      <ZLayerProvider>
        <AppChrome>
          <Outlet />
        </AppChrome>
        <UpdateToast />
      </ZLayerProvider>
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools initialIsOpen={false} />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </MuiThemeAdapter>
  );
}
