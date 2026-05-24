import { Input } from "@monocircuit/monolithium/components";

import { FormModuleProps } from "../types";
import { requiredTextValidator } from "../validators";

const validateTitleRequired = requiredTextValidator("Title");

export default function TitleField({ form }: FormModuleProps) {
  return (
    <form.Field
      name="title"
      validators={{
        onChange: validateTitleRequired,
        onSubmit: validateTitleRequired,
      }}
    >
      {(field: any) => (
        <div className="ml-1.25 mr-1.25">
          <Input
            field={field}
            placeholder="Title"
            className="h-10"
            label="Title"
            maxChars={10}
          />
        </div>
      )}
    </form.Field>
  );
}
