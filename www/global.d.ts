import { type PixiReactElementProps } from "@pixi/react";
import { type Viewport } from "pixi-viewport";
import { type Database as SupabaseDatabase } from "./database";

declare module "@pixi/react" {
  interface PixiElements {
    viewport: PixiReactElementProps<typeof Viewport>;
  }
}

declare global {
  type Database = SupabaseDatabase;

  type Merge<A, B> = {
    [K in keyof A | keyof B]: K extends keyof B
      ? B[K]
      : K extends keyof A
        ? A[K]
        : never;
  };
}
