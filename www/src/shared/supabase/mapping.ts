import zod from "zod";

export namespace $Timestamps {
  export const Normalized = zod.object({
    createdAt: zod.date().describe("timestamp of creation").nullable(),
    updatedAt: zod.date().describe("timestamp of last update").nullable(),
  });

  export const Denormalized = zod.object({
    created_at: zod.date().describe("timestamp of creation").nullable(),
    updated_at: zod.date().describe("timestamp of last update").nullable(),
  });

  export namespace Types {
    export type Normalized = zod.infer<typeof Normalized>;
    export type Denormalized = zod.infer<typeof Denormalized>;
  }
}
