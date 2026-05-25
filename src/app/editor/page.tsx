"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useVitasReader, useCreateVita } from "@/shared/data/local";

const EditorBootstrap = () => {
  const router = useRouter();
  const vitasQuery = useVitasReader();
  const createVita = useCreateVita();

  const vitas = vitasQuery.data;
  const ranRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ranRef.current) return;
    if (vitasQuery.isLoading) return;

    const list = Array.isArray(vitas) ? vitas : vitas ? [vitas] : [];
    const existing = list[0];

    if (existing?.id != null) {
      ranRef.current = true;
      router.replace(`/editor/${existing.id}`);
      return;
    }

    ranRef.current = true;
    void (async () => {
      try {
        const newVita = await createVita.mutateAsync({
          name: "Untitled",
          scope: "private",
          type: "DYNAMIC",
        });
        if (!newVita?.id) {
          setError("Failed to create a new vita.");
          ranRef.current = false;
          return;
        }
        router.replace(`/editor/${newVita.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create a new vita.");
        ranRef.current = false;
      }
    })();
  }, [vitas, vitasQuery.isLoading, router, createVita]);

  return (
    <div className="flex h-full w-full items-center justify-center text-xs text-secondary">
      {error ?? "Loading editor…"}
    </div>
  );
};

export default EditorBootstrap;
