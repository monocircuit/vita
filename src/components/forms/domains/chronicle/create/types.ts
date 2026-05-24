import { ChronicleCreateFormSchema } from "./schema";

export interface ChronicleValidationArgs {
  value: ChronicleCreateFormSchema;
  userId: string | undefined;
}

export interface ChronicleValidationResult {
  category: string;
  normalizedSelectedEntities: string[];
  trimmedTitle: string;
  userId: string;
}
