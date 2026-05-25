"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type { ChronicleView } from "../../../../electron/ipc/contracts";
import type { Entity } from "../../../../electron/db/schema";

interface ChronicleDetail {
  chronicle: ChronicleView | undefined;
  linkedEntities: Entity[];
}

interface ChronicleDetailState {
  detail: ChronicleDetail | null;
  isOpen: boolean;
  openDetail: (
    chronicle: ChronicleView | undefined,
    linkedEntities: Entity[],
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
      chronicle: ChronicleView | undefined,
      linkedEntities: Entity[],
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
