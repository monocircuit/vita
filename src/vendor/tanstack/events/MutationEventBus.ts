import type { TanstackMutationEvent } from "./types";

type TanstackMutationListener = (event: TanstackMutationEvent) => void;

const listeners = new Set<TanstackMutationListener>();
const WINDOW_EVENT_NAME = "monocircuit:tanstack-mutation";

function isBrowserRuntime() {
  return typeof window !== "undefined";
}

export function emitTanstackMutationEvent(event: TanstackMutationEvent) {
  if (isBrowserRuntime()) {
    window.dispatchEvent(
      new CustomEvent<TanstackMutationEvent>(WINDOW_EVENT_NAME, {
        detail: event,
      }),
    );
    return;
  }

  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeTanstackMutationEvents(
  listener: TanstackMutationListener,
) {
  if (isBrowserRuntime()) {
    const handler: EventListener = evt => {
      const customEvent = evt as CustomEvent<TanstackMutationEvent>;
      if (!customEvent.detail) return;
      listener(customEvent.detail);
    };

    window.addEventListener(WINDOW_EVENT_NAME, handler);

    return () => {
      window.removeEventListener(WINDOW_EVENT_NAME, handler);
    };
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
