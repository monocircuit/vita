import {
  EntitySelector,
  useEntityFieldAdapter,
} from "@/components/forms/selectors";

import { FormModuleProps } from "./types";

export default function EntityFieldAdapter({ form }: FormModuleProps) {
  const { validators } = useEntityFieldAdapter();

  return (
    <form.Field name="entity_ids" validators={validators}>
      {(field: any) => (
        <div className="ml-1.25 mr-1.25">
          <EntitySelector
            field={field}
            label="Entity"
            placeholder="Search company"
            className="h-10"
            maxSelected={2}
          />
        </div>
      )}
    </form.Field>
  );
}
