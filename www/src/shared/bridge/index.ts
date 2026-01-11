import { Table as BridgeTable } from "./table/Table";
import { Registry as BridgeRegistry } from "./registry/Registry";
import { InferZodTableSchema } from "./table/types";
import { ZodTypeAny } from "zod";

export namespace Bridge {
  export const Table = BridgeTable;
  export const Registry = BridgeRegistry;
  export type Infer<
    M extends Record<
      string,
      {
        Raw: ZodTypeAny;
        Normalize: ZodTypeAny;
        Denormalize: ZodTypeAny;
        Mutations?: Record<string, { To: ZodTypeAny; From?: ZodTypeAny }>;
      }
    >,
  > = {
    [K in keyof M]: InferZodTableSchema<M[K]>;
  };
  /**
   * Helper to extract the concrete TypeScript type produced by a table mutation's
   * `To` zod schema from a built registry object (e.g. `typeof $Schemas`).
   * Usage: `Bridge.FromSchemas<typeof $Schemas, 'Chronicles', 'Linear'>`.
   */
  export type FromSchemas<
    S,
    Table extends keyof S & string,
    Mutation extends string,
  > = S[Table] extends { Mutations: infer R }
    ? Mutation extends keyof R
      ? R[Mutation] extends { To: infer ToSchema }
        ? ToSchema extends ZodTypeAny
          ? import("zod").output<ToSchema>
          : never
        : never
      : never
    : never;
}
