import { InplaceMultiSelect } from "@monocircuit/monolithium/components";

import { ScopeFieldProps } from "../types";
import { requiredTextValidator } from "../validators";

const validateScopeRequired = requiredTextValidator("Scope");

export default function ScopeField({ form, scopes }: ScopeFieldProps) {
  return (
    <form.Field
      name="scope"
      validators={{
        onChange: validateScopeRequired,
        onSubmit: validateScopeRequired,
      }}
    >
      {(field: any) => (
        <div className="ml-1.25 mr-1.25">
          <InplaceMultiSelect
            field={field}
            options={scopes.map(s => ({ label: s, value: s }))}
            placeholder="Scope"
            label="Scope"
            formField
            className="h-10 w-full"
          />
        </div>
      )}
    </form.Field>
  );
}
