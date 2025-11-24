import createZodSchemaFromTable, {
  InferZodTableSchema,
} from "../../createZodSchemaFromTable";

export const { $Vitas } = await createZodSchemaFromTable("vitas");
export type Vitas = InferZodTableSchema<typeof $Vitas>;
