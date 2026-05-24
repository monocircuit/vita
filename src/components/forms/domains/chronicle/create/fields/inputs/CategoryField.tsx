import { InplaceMultiSelect } from "@monocircuit/monolithium/components";

import { CategoryFieldProps } from "../types";
import { requiredArrayValidator } from "../validators";

const validateCategoryRequired = requiredArrayValidator("Category");

export default function CategoryField({
  form,
  chronicleCategories,
}: CategoryFieldProps) {
  return (
    <form.Field
      name="category"
      validators={{
        onChange: validateCategoryRequired,
        onSubmit: validateCategoryRequired,
      }}
    >
      {(field: any) => (
        <div className="ml-1.25 mr-1.25">
          <InplaceMultiSelect
            multiSelect
            field={field}
            options={chronicleCategories.map(c => ({ label: c, value: c }))}
            placeholder="Category"
            label="Category"
            formField
            maxSelected={2}
            className="h-10 w-full"
          />
        </div>
      )}
    </form.Field>
  );
}
