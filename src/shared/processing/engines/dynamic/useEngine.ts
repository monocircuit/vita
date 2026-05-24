import Engine from "./Engine";
import { useRef, useSyncExternalStore } from "react";

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
    () => engineRef.current.version,
    () => 0, // SSR fallback
  );

  return engineRef.current;
};

export default useEngine;
