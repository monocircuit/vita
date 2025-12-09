"use client";

import Renderer from '@/shared/drawing/dynamic/Renderer'
import useEngine from '@/shared/processing/engines/dynamic/useEngine';
import { $Schemas } from '@/shared/supabase/schemas';
import { useOwnChronicles } from '@/shared/supabase/tables/chronicles';
import React, { useEffect } from 'react'

function Page() {
  /** ANCHOR: Fetched Data */
  const { data: ownChronicles } = useOwnChronicles();

  /** ANCHOR: Engines */
  const engine = useEngine();

  // Effect 1: Engine initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (ownChronicles && ownChronicles.length > 0) {
      console.warn("Engine activated");

      engine.init($Schemas.Chronicles.Mutations.Engine.To.parse(ownChronicles));
    }
  }, [ownChronicles]);
  return (
    <Renderer engine={engine}></Renderer>
  )
}

export default Page