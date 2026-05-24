"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { ZLayerProvider } from "@monocircuit/monolithium/contexts";

export default function Providers({ children }: { children: React.ReactNode }) {
  // nur 1x erstellen – pro Browser-Session
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ZLayerProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ZLayerProvider>
    </ThemeProvider>
  );
}
