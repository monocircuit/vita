import { $Schemas } from "@/shared/supabase/schemas";
import {
  Button,
  DatePicker,
  Input,
  MultiSelectInput,
} from "@monolithium/next/components";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

const ChronicleForm = () => {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      scope: "",
      entity_id: "",
      knots: [] as number[],
    },
    validators: {
      onSubmit: ({ value }) => {
        const res = $Schemas.Chronicles.Normalize.safeParse?.(value);
        if (res && !res.success) return res.error;
        return undefined;
      },
    },
    onSubmit: async ({ value: _value }) => {
      // TODO: Supabase Insert
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
      <form.Field name="title">
        {field => <FieldInput field={field} placeholder="Title" />}
      </form.Field>

      {/* DESCRIPTION */}
      <form.Field name="description">
        {field => <FieldInput field={field} placeholder="Description" />}
      </form.Field>

      {/* CATEGORY */}
      <form.Field name="category">
        {field => (
          <FieldMultiSelectInput field={field} placeholder="Category" />
        )}
      </form.Field>

      {/* SCOPE */}
      <form.Field name="scope">
        {field => <FieldInput field={field} placeholder="Scope" />}
      </form.Field>

      {/* ENTITY */}
      <form.Field name="entity_id">
        {field => <FieldInput field={field} placeholder="Entity" />}
      </form.Field>

      {/* KNOTS */}
      <form.Field name="knots">
        {field => (
          <FieldKnotsDatePickerInput field={field} placeholder="Knots" />
        )}
      </form.Field>

      {/* SUBMIT */}
      <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            text={isSubmitting ? "Submitting..." : "Submit"}
            className="h-10 border-t-(length:--stroke) border-solid border-secondary mt-auto"
            formType="submit"
            isDisabled={!canSubmit || isSubmitting}
          />
        )}
      </form.Subscribe>
    </form>
  );
};

/* ------------------------------------------------------------------ */
/* Reusable Input Binding                                              */
/* ------------------------------------------------------------------ */

interface FieldInputProps {
  field: any;
  placeholder: string;
}

const FieldInput = ({ field, placeholder }: FieldInputProps) => {
  return (
    <div className="ml-1.25 mr-1.25">
      <Input
        name={field.name}
        placeholder={placeholder}
        className="h-10"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e: any) => field.handleChange(e.target.value)}
      />

      {field.state.meta.touchedErrors ? (
        <div className="mt-1 text-sm text-red-500">
          {String(field.state.meta.touchedErrors)}
        </div>
      ) : null}
    </div>
  );
};

const FieldMultiSelectInput = ({ field, placeholder }: FieldInputProps) => {
  const selected =
    typeof field.state.value === "string" && field.state.value.length > 0
      ? [field.state.value]
      : [];

  return (
    <div className="ml-1.25 mr-1.25">
      <MultiSelectInput
        options={[{ label: "Example", value: "example" }]}
        name={field.name}
        placeholder={placeholder}
        className="h-10"
        maxSelected={1}
        value={selected}
        onChange={(next: string[]) => field.handleChange(next[0] ?? "")}
      />

      {field.state.meta.touchedErrors ? (
        <div className="mt-1 text-sm text-red-500">
          {String(field.state.meta.touchedErrors)}
        </div>
      ) : null}
    </div>
  );
};

const msToIsoDate = (ms: number): string => {
  // DatePicker expects an ISO date string (YYYY-MM-DD)
  return new Date(ms).toISOString().slice(0, 10);
};

const isoDateToMs = (isoDate: string): number => {
  return new Date(isoDate).getTime();
};

const FieldKnotsDatePickerInput = ({ field, placeholder }: FieldInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);

  const knots: number[] = Array.isArray(field.state.value)
    ? (field.state.value as number[])
    : [];

  return (
    <div className="ml-1.25 mr-1.25 flex flex-col gap-2.5">
      {knots.map((ms, index) => (
        <DatePicker
          key={index}
          name={`${field.name}.${index}`}
          placeholder={placeholder}
          className="h-10 [&&_[role=dialog]]:bg-primary [&&_[role=dialog]]:text-secondary"
          clearable
          value={Number.isFinite(ms) ? msToIsoDate(ms) : null}
          onChange={next => {
            if (next === null) {
              field.handleChange(knots.filter((_, i) => i !== index));
              return;
            }

            const nextMs = isoDateToMs(next);
            const nextKnots = [...knots];
            nextKnots[index] = nextMs;
            field.handleChange(nextKnots);
          }}
        />
      ))}

      <DatePicker
        name={`${field.name}.new`}
        placeholder={knots.length === 0 ? placeholder : "Add date"}
        className="h-10 [&&_[role=dialog]]:bg-primary [&&_[role=dialog]]:text-secondary"
        clearable
        value={draft}
        onChange={next => {
          if (next === null) {
            setDraft(null);
            return;
          }

          field.handleChange([...knots, isoDateToMs(next)]);
          setDraft(null);
        }}
      />

      {field.state.meta.touchedErrors ? (
        <div className="mt-1 text-sm text-red-500">
          {String(field.state.meta.touchedErrors)}
        </div>
      ) : null}
    </div>
  );
};

export default ChronicleForm;
