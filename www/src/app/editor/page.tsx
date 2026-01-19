"use client";

import Renderer from "@/shared/drawing/dynamic/Renderer";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";
import { $Schemas } from "@/shared/supabase/schemas";
import { useOwnChronicles } from "@/shared/supabase/tables/chronicles";
import useOwnVitas from "@/shared/supabase/tables/vitas/$read/useOwnVitas";
import { useDynamicShardsByVitaId } from "@/shared/supabase/tables/vitas/shards/dynamic";
import React, { useEffect } from "react";

function Page() {
  /** ANCHOR: Fetched Data */
  const { data: ownChronicles } = useOwnChronicles();
  const { data: ownVitas } = useOwnVitas();
  // const { data: ownVitaShards } = useDynamicShardsByVitaId(ownVitas?.[0]?.id);

  /** ANCHOR: Engines */
  const engine = useEngine();

  // Effect 1: Engine initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (ownChronicles && ownChronicles.length > 0 && !engine.loaded) {
      console.warn("Engine activated");

      engine.init($Schemas.Chronicles.Mutations.Engine.To.parse(ownChronicles));
    }
  }, [ownChronicles]);
  return <Renderer engine={engine}></Renderer>;
}

export default Page;
