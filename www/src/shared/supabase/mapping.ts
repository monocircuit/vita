import { sqlToZod } from "@/utils/sqlToZod";
import zod from "zod";

export namespace Timestamps {
  export const $Raw = zod.object({
    created_at: sqlToZod("date").describe("timestamp of creation").nullable(),
    updated_at: sqlToZod("date")
      .describe("timestamp of last update")
      .nullable(),
  });

  export const $Normalized = zod.object({
    createdAt: sqlToZod("date").describe("timestamp of creation"),
  });

  export type Normalized = zod.infer<typeof $Normalized>;
  export type Raw = zod.infer<typeof $Raw>;
}
