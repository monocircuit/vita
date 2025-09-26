import { Chronicle } from "@/utils/schemas/Chronicle";
import Engine from "./Engine";
import { useEffect, useRef, useState } from "react";

const useEngine = () => {
  const [isEngineLoaded, setIsEngineLoaded] = useState(false);
  const engineRef = useRef<Engine>(new Engine());

  return {
    init: (chronicles: Chronicle[]) => {
      engineRef.current.init(chronicles);
      setIsEngineLoaded(engineRef.current.isLoaded());
    },
    engine: engineRef,
  };
};

export default useEngine;
