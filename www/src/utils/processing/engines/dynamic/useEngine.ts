import {
  iTChronicle,
  oTLinearChronicle,
} from "@/shared/supabase/tables/chronicles/mapping";
import Engine from "./Engine";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/**
 * @author Lukas Diegelmann
 *
 * Makes the engine accessible within React components. Handles loading state.
 */
const useEngine = () => {
  /*
   * Initialize empty Engine inside a ref to prevent initialization on every
   * render.
   */
  const engineRef = useRef<Engine>(new Engine());

  /*
   * Subscription logic
   */
  useSyncExternalStore(
    cb => engineRef.current.subscribe(cb),
    () => engineRef.current.loaded,
    () => false, // SSR fallback
  );

  return engineRef.current;
};

export default useEngine;
