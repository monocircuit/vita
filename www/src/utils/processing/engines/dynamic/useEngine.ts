import {
  iTChronicle,
  oTLinearChronicle,
} from "@/shared/supabase/tables/chronicles/mapping";
import Engine from "./Engine";
import { useEffect, useRef, useState } from "react";

const useEngine = () => {
  const [isEngineLoaded, setIsEngineLoaded] = useState(false);
  const engineRef = useRef<Engine>(new Engine());

  return {
    init: (chronicles: oTLinearChronicle[]) => {
      engineRef.current.init(chronicles);
      setIsEngineLoaded(engineRef.current.isLoaded());
    },
    engine: engineRef,
  };
};

export default useEngine;
