import { Input } from "@monocircuit/monolithium/components";

import { FormModuleProps } from "../types";
import { requiredTextValidator } from "../validators";

const validateDescriptionRequired = requiredTextValidator("Description");

export default function DescriptionField({ form }: FormModuleProps) {
  return (
    <form.Field
      name="description"
      validators={{
        onChange: validateDescriptionRequired,
        onSubmit: validateDescriptionRequired,
      }}
    >
      {(field: any) => (
        <div className="ml-1.25 mr-1.25">
          <Input
            field={field}
            placeholder="Description"
            label="Description"
            multiline={true}
          />
        </div>
      )}
    </form.Field>
  );
}
