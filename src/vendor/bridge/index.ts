import { Table as BridgeTable } from "./table/Table";
import { Registry as BridgeRegistry } from "./registry/Registry";
import { DbShape, DbTableName, InferZodTableSchema } from "./table/types";
import { ZodTypeAny } from "zod";

/**
 * Client configuration helpers for connecting bridge internals to a host app.
 */
export { configureBridgeClient, getBridgeClient } from "./client";

/**
 * Public bridge API namespace.
 *
 * - `Bridge.Table` creates typed table builders.
 * - `Bridge.Registry` composes and builds multiple table schemas.
 * - `Bridge.Infer` maps built zod schemas to ergonomic TypeScript types.
 */
export namespace Bridge {
  /** Fluent table builder entrypoint. */
  export const Table = BridgeTable;
  /** Registry builder for composing multiple table definitions. */
  export const Registry = BridgeRegistry;

  /**
   * Creates a database-bound Bridge API.
   *
   * Use this when you want to provide the generated Supabase `Database` type
   * once and keep all subsequent table definitions strongly typed.
   */
  export function withDatabase<DB extends DbShape>() {
    return {
      Table: {
        create<TableName extends DbTableName<DB>>(tableName: TableName) {
          return BridgeTable.create<DB, TableName>(tableName);
        },
      },
      Registry: BridgeRegistry,
    };
  }

  /**
   * Infers strongly typed table schemas from a built registry object.
   */
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
