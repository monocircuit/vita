import {
  InferZodTableSchema,
  table,
} from "@/shared/supabase/createZodSchemaFromTable";

export const { $VitasShardsDynamic } = await table(
  "vitas_shards_dynamic",
).build();

export type VitasShardsDynamic = InferZodTableSchema<
  typeof $VitasShardsDynamic
>;
