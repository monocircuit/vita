import { Button, Input } from "@monocircuit/monolithium/components";
import { useForm } from "@tanstack/react-form";

interface EntityCreateFormValues {
  name: string;
  description: string;
}

interface EntityCreateFormProps {
  onSubmitEntity?: (values: EntityCreateFormValues) => Promise<void> | void;
}

const EntityCreateForm = (props: EntityCreateFormProps) => {
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    } as EntityCreateFormValues,
    validators: {
      onSubmit: ({ value }) => {
        if (!String(value.name ?? "").trim()) {
          return "Entity name is required";
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      await props.onSubmitEntity?.(value);
    },
  });

  return (
    <form
      id="new-entity-form"
      className="size-full flex flex-col gap-2.5 overflow-visible"
      onSubmit={event => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) =>
            !String(value ?? "").trim() ? "Entity name is required" : undefined,
          onSubmit: ({ value }) =>
            !String(value ?? "").trim() ? "Entity name is required" : undefined,
        }}
      >
        {field => (
          <div className="ml-1.25 mr-1.25">
            <Input
              field={field}
              placeholder="Entity name"
              label="Entity"
              className="h-10"
              maxChars={64}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {field => (
          <div className="ml-1.25 mr-1.25">
            <Input
              field={field}
              placeholder="Description"
              label="Description"
              multiline={true}
              maxChars={200}
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            text={isSubmitting ? "Submitting..." : "Add Entity"}
            className="h-10 border-t-(length:--stroke) border-solid border-secondary mt-auto"
            formType="submit"
            isDisabled={isSubmitting || !canSubmit}
          />
        )}
      </form.Subscribe>
    </form>
  );
};

export default EntityCreateForm;
