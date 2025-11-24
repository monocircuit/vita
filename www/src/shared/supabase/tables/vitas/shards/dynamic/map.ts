import createZodSchemaFromTable, {
  InferZodTableSchema,
} from "@/shared/supabase/createZodSchemaFromTable";

export const { $VitasShardsDynamic } = await createZodSchemaFromTable(
  "vitas_shards_dynamic",
);
export type VitasShardsDynamic = InferZodTableSchema<
  typeof $VitasShardsDynamic
>;
