"use client";

import { subscribeTanstackMutationEvents } from "@/vendor/tanstack";
import { useEffect, useRef } from "react";

interface UseTanstackMutationAddressSubscriberOptions {
  addressPrefix: readonly unknown[];
  onMatch: () => void | Promise<void>;
  onMatchStart?: () => void;
  debounceMs?: number;
}

function hasAddressPrefix(
  address: readonly unknown[],
  prefix: readonly unknown[],
) {
  if (address.length < prefix.length) {
    return false;
  }

  return prefix.every((part, index) => address[index] === part);
}

export default function useTanstackMutationAddressSubscriber({
  addressPrefix,
  onMatch,
  onMatchStart,
  debounceMs = 150,
}: UseTanstackMutationAddressSubscriberOptions) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeTanstackMutationEvents(event => {
      if (!hasAddressPrefix(event.address, addressPrefix)) {
        return;
      }

      onMatchStart?.();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        void onMatch();
      }, debounceMs);
    });

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      unsubscribe();
    };
  }, [addressPrefix, debounceMs, onMatch, onMatchStart]);
}
