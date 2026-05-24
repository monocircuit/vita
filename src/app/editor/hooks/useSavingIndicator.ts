"use client";

import { useIsMutating } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { subscribeTanstackMutationEvents } from "@/vendor/tanstack";

export type SavingState = "idle" | "saving" | "saved";

export function useSavingIndicator(): SavingState {
  const isMutating = useIsMutating();
  const [justSaved, setJustSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTanstackMutationEvents(() => {
      setJustSaved(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setJustSaved(false), 1500);
    });
    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (isMutating > 0) return "saving";
  if (justSaved) return "saved";
  return "idle";
}
