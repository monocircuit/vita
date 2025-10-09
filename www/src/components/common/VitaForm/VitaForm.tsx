import { $VitaDynamic, VitaDynamic } from "@/utils/schemas/VitaDynamic";
import {} from "@/utils/supabase/api/tables/vitas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@monolithium/next/components";
import React from "react";
import { useForm } from "react-hook-form";

interface Props {}

const VitaForm = (props: Props) => {
  /** ANCHOR: Forms */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VitaDynamic>({
    resolver: zodResolver($VitaDynamic),
  });

  return (
    <form
      id="vita-form"
      className="size-full flex flex-col gap-[10px] overflow-hidden"
      onSubmit={handleSubmit(createDynamicVita)}
    >
      <div
        id="vita-form__title"
        className="justify-center text-center border-b-(length:--stroke) border-solid border-secondary"
      >
        Add new Vita Dynamic
      </div>
      <Input
        name="name"
        placeholder="Name"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("name", { required: true })}
        error={errors.name?.message}
      />
      <Input
        name="chronicleRelationID"
        placeholder="Chronicle Relation ID"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("chronicleRelationId", { required: true })}
        error={errors.chronicleRelationId?.message}
      />
      <Input
        name="scope"
        placeholder="Scope"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("scope", { required: true })}
        error={errors.scope?.message}
      />
      <Button
        text="Submit"
        className="h-[40px] border-t-(length:--stroke) border-solid border-secondary mt-auto"
        formType="submit"
      />
    </form>
  );
};

export default VitaForm;
