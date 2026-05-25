import {
  useChronicleCategories,
  useScopes,
  useEntitiesReader,
  useCreateEntity,
  useCreateChronicle,
  useLinkChronicleEntities,
  useReplaceShardsForVita,
  useShardsByVitaIdReader,
} from "@/shared/data/local";
import { formatUtcMsToGermanDate } from "@/lib/formatUtcMsToGermanDate";
import { Scrollable } from "@monocircuit/monolithium/components";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  EntityFieldAdapter,
  KnotsFieldAdapter,
} from "@/components/forms/adapters";

import { ChronicleValidationArgs, ChronicleValidationResult } from "./types";
import {
  $ChronicleCreateFormSchema,
  ChronicleCreateFormSchema,
} from "./schema";

import {
  CategoryField,
  DescriptionField,
  ScopeField,
  SubmitButton,
  SubmitFeedback,
  TitleField,
} from "./fields";

function validateChronicleSubmission(
  args: ChronicleValidationArgs,
): ChronicleValidationResult {
  const { value } = args;

  const category = Array.isArray(value.category)
    ? (value.category[0] ?? "")
    : String(value.category ?? "");
  const normalizedSelectedEntities = Array.isArray(value.entity_ids)
    ? value.entity_ids
        .map(entry => String(entry ?? "").trim())
        .filter(entry => entry.length > 0)
    : String(value.entity_ids ?? "").trim().length > 0
      ? [String(value.entity_ids).trim()]
      : [];
  const trimmedTitle = String(value.title ?? "").trim();

  return {
    category,
    normalizedSelectedEntities,
    trimmedTitle,
  };
}

type ChronicleCreateFormProps = {
  vitaId?: number;
};

const ChronicleCreateForm = ({ vitaId }: ChronicleCreateFormProps = {}) => {
  const createChronicle = useCreateChronicle();
  const createEntity = useCreateEntity();
  const linkEntities = useLinkChronicleEntities();
  const replaceShards = useReplaceShardsForVita();

  const { data: allEntities } = useEntitiesReader();
  const { data: scopes } = useScopes();
  const { data: chronicleCategories } = useChronicleCategories();
  const { data: existingShards } = useShardsByVitaIdReader(vitaId ?? null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const defaultValues: ChronicleCreateFormSchema = {
    title: "",
    description: "",
    category: [],
    scope: "",
    entity_ids: [],
    knots: [],
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      setSubmitSuccess(null);

      try {
        const parseResult = $ChronicleCreateFormSchema.safeParse(value);
        if (!parseResult.success) {
          setSubmitError(
            parseResult.error.issues[0]?.message ?? "Form data is invalid.",
          );
          return;
        }

        const parsedValue = parseResult.data;
        const { category, normalizedSelectedEntities, trimmedTitle } =
          validateChronicleSubmission({
            value: parsedValue,
          });

        const entityOptions = Array.isArray(allEntities) ? allEntities : [];
        const resolvedEntityIds: number[] = [];

        for (const selectedEntity of normalizedSelectedEntities) {
          const candidateId = Number(selectedEntity);
          if (Number.isFinite(candidateId)) {
            const exists = entityOptions.some(e => e.id === candidateId);
            if (exists) {
              resolvedEntityIds.push(candidateId);
              continue;
            }
          }
          const newEntity = await createEntity.mutateAsync({
            name: selectedEntity,
            address: null,
          });
          if (newEntity?.id != null) resolvedEntityIds.push(newEntity.id);
        }

        const uniqueResolvedEntityIds = Array.from(new Set(resolvedEntityIds));

        const createdChronicle = await createChronicle.mutateAsync({
          title: trimmedTitle,
          description: parsedValue.description.trim() || null,
          category: category as never,
          scope: parsedValue.scope as never,
          orientation: null,
          knots: parsedValue.knots,
        });

        const createdChronicleId = createdChronicle?.id ?? null;

        if (createdChronicleId !== null && uniqueResolvedEntityIds.length > 0) {
          await linkEntities.mutateAsync({
            chronicleId: createdChronicleId,
            entityIds: uniqueResolvedEntityIds,
          });
        }

        if (
          createdChronicleId !== null &&
          typeof vitaId === "number" &&
          Number.isFinite(vitaId)
        ) {
          const existing = existingShards ?? [];
          await replaceShards.mutateAsync({
            vitaId,
            shards: [
              ...existing.map(s => ({
                chronicleId: s.chronicleId,
                x: s.x,
                y: s.y,
                prevId: s.prevId,
                nextId: s.nextId,
              })),
              {
                chronicleId: createdChronicleId,
                x: 0,
                y: 0,
                prevId: null,
                nextId: null,
              },
            ],
          });
        }

        form.reset();
        setSubmitSuccess("Chronicle created successfully.");
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Creating chronicle failed.",
        );
      }
    },
  });

  return (
    <form
      id="chronicle-form"
      className="h-full flex flex-col"
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <Scrollable shouldScrollY className="flex-1 min-h-0">
        <div className="flex flex-col gap-2.5 py-2">
          <TitleField form={form} />
          <DescriptionField form={form} />
          <CategoryField
            form={form}
            chronicleCategories={chronicleCategories ?? []}
          />
          <ScopeField form={form} scopes={scopes ?? []} />
          <EntityFieldAdapter form={form} />
          <KnotsFieldAdapter
            form={form}
            formatKnots={formatUtcMsToGermanDate}
          />
        </div>
      </Scrollable>
      <div className="shrink-0">
        <SubmitButton form={form} />
        <SubmitFeedback
          submitError={submitError}
          submitSuccess={submitSuccess}
        />
      </div>
    </form>
  );
};

export default ChronicleCreateForm;
