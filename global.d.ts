import { type PixiReactElementProps } from "@pixi/react";
import { type Viewport } from "pixi-viewport";
import type { Api } from "./electron/ipc/contracts";

declare module "@pixi/react" {
  interface PixiElements {
    viewport: PixiReactElementProps<typeof Viewport>;
  }
}

declare global {
  interface Window {
    api: Api;
  }

  type Merge<A, B> = {
    [K in keyof A | keyof B]: K extends keyof B
      ? B[K]
      : K extends keyof A
        ? A[K]
        : never;
  };

  type Overwrite<T, R extends { [K in keyof T]?: any }> = Omit<T, keyof R> & R;
}
