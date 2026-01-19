"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ZLayerProvider } from "@monolithium/next/contexts";

export default function Providers({ children }: { children: React.ReactNode }) {
  // nur 1x erstellen – pro Browser-Session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ZLayerProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ZLayerProvider>
  );
}
