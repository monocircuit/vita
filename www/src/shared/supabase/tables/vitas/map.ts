import { InferZodTableSchema, table } from "../../createZodSchemaFromTable";

export const { $Vitas } = await table("vitas").build();
export type Vitas = InferZodTableSchema<typeof $Vitas>;
