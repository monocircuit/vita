"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { NormalizedRowFor } from "@/shared/data/tanstack";

interface ChronicleDetail {
  chronicle: NormalizedRowFor<"chronicles"> | undefined;
  linkedEntities: NormalizedRowFor<"entities">[];
}

interface ChronicleDetailState {
  detail: ChronicleDetail | null;
  isOpen: boolean;
  openDetail: (
    chronicle: NormalizedRowFor<"chronicles"> | undefined,
    linkedEntities: NormalizedRowFor<"entities">[],
  ) => void;
  closeDetail: () => void;
}

const ChronicleDetailContext = createContext<ChronicleDetailState>({
  detail: null,
  isOpen: false,
  openDetail: () => undefined,
  closeDetail: () => undefined,
});

export function ChronicleDetailProvider({ children }: { children: React.ReactNode }) {
  const [detail, setDetail] = useState<ChronicleDetail | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDetail = useCallback(
    (
      chronicle: NormalizedRowFor<"chronicles"> | undefined,
      linkedEntities: NormalizedRowFor<"entities">[],
    ) => {
      setDetail({ chronicle, linkedEntities });
      setIsOpen(true);
    },
    [],
  );

  const closeDetail = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ChronicleDetailContext.Provider value={{ detail, isOpen, openDetail, closeDetail }}>
      {children}
    </ChronicleDetailContext.Provider>
  );
}

export function useChronicleDetail() {
  return useContext(ChronicleDetailContext);
}
