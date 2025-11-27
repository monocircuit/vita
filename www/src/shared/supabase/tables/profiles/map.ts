import { InferZodTableSchema, table } from "../../createZodSchemaFromTable";

export const { $Profiles } = await table("profiles")
  .column("dayOfBirth")
  .normalize(raw => (raw ? new Date(raw) : null))
  .denormalize(norm => (norm ? norm.toISOString() : null))
  .build();

export type Profiles = InferZodTableSchema<typeof $Profiles>;
