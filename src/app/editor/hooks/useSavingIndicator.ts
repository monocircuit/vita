"use client";

import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

export type SavingState = "idle" | "saving" | "saved";

export function useSavingIndicator(): SavingState {
  const isMutating = useIsMutating();
  const queryClient = useQueryClient();
  const [justSaved, setJustSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const cache = queryClient.getMutationCache();
    const unsubscribe = cache.subscribe(event => {
      if (
        event.type === "updated" &&
        event.mutation?.state.status === "success"
      ) {
        setJustSaved(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setJustSaved(false), 1500);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [queryClient]);

  if (isMutating > 0) return "saving";
  if (justSaved) return "saved";
  return "idle";
}
