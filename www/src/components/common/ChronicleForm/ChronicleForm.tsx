import { $Schemas } from "@/shared/supabase/schemas";
import {
  Button,
  Input,
  KnotsInput,
  MultiSelect,
} from "@monolithium/next/components";
import { useForm } from "@tanstack/react-form";

const ChronicleForm = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: [] as string[],
      scope: "",
      entity_id: "",
      knots: [] as number[],
    },
    validators: {
      onSubmit: ({ value }) => {
        const normalizedForSchema = {
          ...value,
          // Chronicle schema currently expects a single category string.
          // The form stores an array to support multi-select.
          category: Array.isArray(value.category)
            ? (value.category[0] ?? "")
            : value.category,
        };

        const res =
          $Schemas.Chronicles.Normalize.safeParse?.(normalizedForSchema);
        if (res && !res.success) return res.error;
        return undefined;
      },
    },
    onSubmit: async ({ value: _value }) => {
      // TODO: Supabase Insert
      void _value;
    },
  });

  return (
    <form
      id="chronicle-form"
      className="size-full flex flex-col gap-2.5 overflow-visible"
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {/* TITLE */}
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) =>
            !String(value ?? "").trim() ? "Title is required" : undefined,
          onSubmit: ({ value }) =>
            !String(value ?? "").trim() ? "Title is required" : undefined,
        }}
      >
        {field => (
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

      {/* DESCRIPTION */}
      <form.Field
        name="description"
        validators={{
          onChange: ({ value }) =>
            !String(value ?? "").trim() ? "Description is required" : undefined,
          onSubmit: ({ value }) =>
            !String(value ?? "").trim() ? "Description is required" : undefined,
        }}
      >
        {field => (
          <div className="ml-1.25 mr-1.25">
            <Input
              field={field}
              placeholder="Description"
              className="h-10"
              label="Description"
              maxChars={10}
            />
          </div>
        )}
      </form.Field>

      {/* CATEGORY */}
      <form.Field
        name="category"
        validators={{
          onChange: ({ value }) =>
            Array.isArray(value) && value.length > 0
              ? undefined
              : "Category is required",
          onSubmit: ({ value }) =>
            Array.isArray(value) && value.length > 0
              ? undefined
              : "Category is required",
        }}
      >
        {field => (
          <div className="ml-1.25 mr-1.25">
            <MultiSelect
              field={field}
              options={[
                { label: "Example", value: "example" },
                { label: "Sample", value: "sample" },
              ]}
              placeholder="Category"
              label="Category"
              className="h-10"
              maxSelected={2}
            />
          </div>
        )}
      </form.Field>

      {/* SCOPE */}
      <form.Field
        name="scope"
        validators={{
          onChange: ({ value }) =>
            !String(value ?? "").trim() ? "Scope is required" : undefined,
          onSubmit: ({ value }) =>
            !String(value ?? "").trim() ? "Scope is required" : undefined,
        }}
      >
        {field => (
          <div className="ml-1.25 mr-1.25">
            <Input
              field={field}
              placeholder="Scope"
              className="h-10"
              label="Scope"
              maxChars={10}
            />
          </div>
        )}
      </form.Field>

      {/* ENTITY */}
      <form.Field
        name="entity_id"
        validators={{
          onChange: ({ value }) =>
            !String(value ?? "").trim() ? "Entity is required" : undefined,
          onSubmit: ({ value }) =>
            !String(value ?? "").trim() ? "Entity is required" : undefined,
        }}
      >
        {field => (
          <div className="ml-1.25 mr-1.25">
            <Input
              field={field}
              placeholder="Entity"
              className="h-10"
              label="Entity"
              maxChars={10}
            />
          </div>
        )}
      </form.Field>

      {/* KNOTS */}
      <form.Field name="knots">
        {field => {
          return (
            <div className="ml-1.25 mr-1.25">
              <KnotsInput
                field={field}
                placeholder="Knots"
                className="min-h-10 bg-transparent text-secondary"
                format={msToIsoDate}
              />
            </div>
          );
        }}
      </form.Field>

      {/* SUBMIT */}
      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
        {([_canSubmit, isSubmitting]) => (
          <Button
            text={isSubmitting ? "Submitting..." : "Add"}
            className="h-10 border-t-(length:--stroke) border-solid border-secondary mt-auto"
            formType="submit"
            isDisabled={isSubmitting}
          />
        )}
      </form.Subscribe>
    </form>
  );
};

const msToIsoDate = (ms: number): string =>
  new Date(ms).toISOString().slice(0, 10);

export default ChronicleForm;
