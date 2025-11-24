import createZodSchemaFromTable, {
  InferZodTableSchema,
} from "../../createZodSchemaFromTable";

export const { $Profiles } = await createZodSchemaFromTable(
  "profiles",
  raw => ({
    dayOfBirth: raw.dayOfBirth ? new Date(raw.dayOfBirth) : null,
  }),
);

export type Profiles = InferZodTableSchema<typeof $Profiles>;
