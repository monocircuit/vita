import { $Schemas, Schemas } from "@/shared/supabase/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@monolithium/next/components";
import { useForm } from "@tanstack/react-form";

const ChronicleForm = () => {
  /** ANCHOR: Forms */
  const form = useForm({
    validators: {
      onSubmit: $Schemas.Chronicles.Normalize,
    },
  });

  return (
    <form
      id="chronicle-form"
      className="size-full flex flex-col gap-[10px] overflow-hidden"
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
    >
      <div
        id="chronicle-form__title"
        className="justify-center text-center border-b-(length:--stroke) border-solid border-secondary"
      >
        Add new Chronicle
      </div>
      <form.Field
        name="title"
        children={field => (
          <>
            <Input
              name="title"
              placeholder="Title"
              className="h-[40px] ml-[5px] mr-[5px]"
            />
          </>
        )}
      />
      {/* 
      <Input
        name="description"
        placeholder="Description"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("description", { required: true })}
        error={errors.description?.message}
      />
      <Input
        name="category"
        placeholder="Category"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("category", { required: true })}
        error={errors.category?.message}
      />
      <Input
        name="scope"
        placeholder="Scope"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("scope", { required: true })}
        error={errors.scope?.message}
      />
      <Input
        name="entity_id"
        placeholder="Entity"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("entity_id", { required: true })}
        error={errors.entityId?.message}
      /> */}
      {/* <Input
        name="knots"
        placeholder="Knots"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("knots", { required: true })}
        error={errors.knots?.message}
      /> */}

      <form.Subscribe
        selector={state => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            text="Submit"
            className="h-[40px] border-t-(length:--stroke) border-solid border-secondary mt-auto"
            formType="submit"
          />
        )}
      />
    </form>
  );
};

export default ChronicleForm;
