import { z } from "zod";

export const $ChronicleCreateFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string(),
  category: z.array(z.string().trim()).min(1, "Please select a category."),
  scope: z.string().trim().min(1, "Please select a scope."),
  entity_ids: z.array(z.string().trim()),
  knots: z.array(z.number().finite("Each knot must be a valid number.")),
});

export type ChronicleCreateFormSchema = z.infer<
  typeof $ChronicleCreateFormSchema
>;
