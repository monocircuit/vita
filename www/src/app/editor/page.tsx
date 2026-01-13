"use client";
import { FreeNoteData } from "@/shared/drawing/dynamic/drawDraggableNote";
import Renderer from "@/shared/drawing/dynamic/Renderer";
import { BranchStyle } from "@/shared/drawing/dynamic/styleApi";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";
import { $Schemas } from "@/shared/supabase/schemas";
import { useOwnChronicles } from "@/shared/supabase/tables/chronicles";
import useOwnVitas from "@/shared/supabase/tables/vitas/$read/useOwnVitas";
import React, { useEffect, useState } from "react";

function Page() {
  /** ANCHOR: Fetched Data */
  const { data: ownChronicles } = useOwnChronicles();
  const { data: ownVitas } = useOwnVitas();
  const [notes, setNotes] = useState<FreeNoteData[]>([
    { id: "1", content: "Hallo Welt", x: 100, y: 100 }
  ]);
  // const { data: ownVitaShards } = useDynamicShardsByVitaId(ownVitas?.[0]?.id);

  /** ANCHOR: Engines */
  const engine = useEngine();

  // Effect 1: Engine initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (ownChronicles && ownChronicles.length > 0) {
      console.warn("Engine activated");

      engine.init($Schemas.Chronicles.Mutations.Engine.To.parse(ownChronicles));
    }
  }, [ownChronicles]);

  const branchStyles = new Map<string, BranchStyle>([
    ['101', { color: 0xff0020, thickness: 6 }],

  ]);

  console.log("Rendering with notes:", notes);
  const handleNoteMove = (id: string, x: number, y: number) => {
    setNotes(prev => prev.map(n => 
      n.id === id ? { ...n, x, y } : n
    ));
    console.log(`Note ${id} moved to`, x, y);
  };

  // Handler: Neue Notiz erstellen (z.B. per Shift+Click)
  const handleCreateNote = (x: number, y: number) => {
    const newNote: FreeNoteData = {
      id: Math.random().toString(36).substr(2, 9),
      content: "Neue Notiz",
      x,
      y
    };
    setNotes(prev => [...prev, newNote]);
  };

  return <Renderer engine={engine} branchStyles={branchStyles}onNoteMove={handleNoteMove}
      onCanvasDoubleTap={handleCreateNote} notes={notes}></Renderer>;
}

export default Page;
