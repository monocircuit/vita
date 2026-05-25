import { ChronicleCreateFormSchema } from "./schema";

export interface ChronicleValidationArgs {
  value: ChronicleCreateFormSchema;
}

export interface ChronicleValidationResult {
  category: string;
  normalizedSelectedEntities: string[];
  trimmedTitle: string;
}
