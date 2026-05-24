"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@monocircuit/monolithium/components";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import useVitaWriter from "@/shared/data/tables/vitas/$write/useVitaWriter";
import useOwnProfileReader from "@/shared/data/tables/profiles/read/useOwnProfileReader";

const VITA_TYPES = ["DYNAMIC", "STATIC"] as const;

const vitaFormSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  scope: z.string().min(1, "Scope ist erforderlich"),
  type: z.enum(VITA_TYPES),
});

type VitaFormValues = z.infer<typeof vitaFormSchema>;

export interface VitaFormInitialValues {
  id?: number;
  name?: string;
  scope?: string | null;
  type?: (typeof VITA_TYPES)[number];
}

interface Props {
  initialValues?: VitaFormInitialValues;
  onSuccess?: (vita?: { id: number }) => void;
}

const VitaForm = ({ initialValues, onSuccess }: Props) => {
  const isEdit = typeof initialValues?.id === "number";

  const vitaWriter = useVitaWriter();
  const { data: ownProfile } = useOwnProfileReader();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VitaFormValues>({
    resolver: zodResolver(vitaFormSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      scope: initialValues?.scope ?? "",
      type: initialValues?.type ?? "DYNAMIC",
    },
  });

  const onSubmit = handleSubmit(async values => {
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      if (!ownProfile?.id) {
        setSubmitError("No user profile loaded.");
        return;
      }

      const result = await vitaWriter.write({
        ...(isEdit ? { id: initialValues!.id } : {}),
        name: values.name.trim(),
        scope: values.scope as any,
        type: values.type,
        userId: ownProfile.id,
      } as any);

      setSubmitSuccess(
        isEdit ? "Vita updated successfully." : "Vita created successfully.",
      );

      const newVita = !isEdit
        ? (result as { rows?: { id?: number }[] } | undefined)?.rows?.[0]
        : undefined;
      onSuccess?.(newVita?.id ? { id: newVita.id } : undefined);
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Saving vita failed.";
      setSubmitError(message);
    }
  });

  return (
    <form
      id="vita-form"
      onSubmit={onSubmit}
      className="size-full flex flex-col gap-[10px] overflow-hidden"
    >
      <div
        id="vita-form__title"
        className="justify-center text-center border-b-(length:--stroke) border-solid border-border p-2"
      >
        {isEdit ? "Edit Vita" : "Add new Vita"}
      </div>
      <Input
        name="name"
        placeholder="Name"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("name", { required: true })}
        error={errors.name?.message}
      />
      <Input
        name="scope"
        placeholder="Scope"
        className="h-[40px] ml-[5px] mr-[5px]"
        register={register("scope", { required: true })}
        error={errors.scope?.message}
      />
      <select
        {...register("type", { required: true })}
        className="h-[40px] ml-[5px] mr-[5px] bg-transparent border-solid border-border border-(length:--stroke) px-2"
      >
        {VITA_TYPES.map(t => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {submitError ? (
        <div className="text-error text-xs px-2">{submitError}</div>
      ) : null}
      {submitSuccess ? (
        <div className="text-fg text-xs px-2">{submitSuccess}</div>
      ) : null}
      <Button
        text={isSubmitting ? "Saving..." : isEdit ? "Save" : "Create"}
        className="h-[40px] border-t-(length:--stroke) border-solid border-border mt-auto"
        formType="submit"
      />
    </form>
  );
};

export default VitaForm;
