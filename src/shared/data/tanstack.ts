import {
  Tanstack,
  configureTanstackClient,
  configureTanstackSchemas,
  makeOwn,
  makeOwnWriter,
  type NormalizedRowFor as PackageNormalizedRowFor,
} from "@/vendor/tanstack";
import { createClient } from "@/shared/data/client";
import "@/shared/data/tanstack.adapter";
import type { Schemas } from "@/shared/data/schemas";
import type { Database } from "../../../database";

configureTanstackClient(() => createClient() as any);
configureTanstackSchemas(async () => {
  const mod = await import("@/shared/data/schemas");
  return (mod as any).$Schemas as Record<string, any>;
});

export const VitaTanstack =
  Tanstack.withDatabase<Database>().withSchemas<Schemas>();

export const TanstackReader = VitaTanstack.Reader;
export const TanstackWriter = VitaTanstack.Writer;
export const TanstackDeleter = VitaTanstack.Deleter;

export { makeOwn, makeOwnWriter };

export type NormalizedRowFor<Table extends keyof Database["public"]["Tables"]> =
  PackageNormalizedRowFor<Database, Schemas, Extract<Table, string>>;

const TanstackDefault = Object.assign(
  ((...args: Parameters<typeof makeOwn>) =>
    (makeOwn as any)(...args)) as typeof makeOwn,
  TanstackReader,
);

export default TanstackDefault;
