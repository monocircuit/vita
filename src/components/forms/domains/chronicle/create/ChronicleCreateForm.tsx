import { useChronicleCategory, useScope } from "@/shared/data/enums";
import { useChronicleEntityWriter } from "@/shared/data/tables/chronicleEntities";
import { useChronicleWriter } from "@/shared/data/tables/chronicles";
import { useDynamicShardsWriter } from "@/shared/data/tables/vitas/shards/dynamic";
import useAllEntitiesReader from "@/shared/data/tables/entities/useAllEntitiesReader";
import { ChronicleValidationArgs, ChronicleValidationResult } from "./types";
import {
  $ChronicleCreateFormSchema,
  ChronicleCreateFormSchema,
} from "./schema";
import { useEntityWriter } from "@/shared/data/tables/entities";
import useOwnProfileReader from "@/shared/data/tables/profiles/read/useOwnProfileReader";
import { formatUtcMsToGermanDate } from "@/lib/formatUtcMsToGermanDate";
import { Scrollable } from "@monocircuit/monolithium/components";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  EntityFieldAdapter,
  KnotsFieldAdapter,
} from "@/components/forms/adapters";

import {
  CategoryField,
  DescriptionField,
  ScopeField,
  SubmitButton,
  SubmitFeedback,
  TitleField,
} from "./fields";

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function validateChronicleSubmission(
  args: ChronicleValidationArgs,
): ChronicleValidationResult {
  const { value, userId } = args;

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

  if (!userId) {
    throw new Error("No user profile loaded");
  }

  return {
    category,
    normalizedSelectedEntities,
    trimmedTitle,
    userId,
  };
}

type ChronicleCreateFormProps = {
  /**
   * When set, a seed shard is written to `vitas_shards_dynamic` for this vita
   * so the new chronicle is scoped to the current vita. Without it, the
   * chronicle is created user-globally but not attached to any vita.
   */
  vitaId?: number;
};

const ChronicleCreateForm = ({ vitaId }: ChronicleCreateFormProps = {}) => {
  /** ANCHOR: Writers */
  const chronicleWriter = useChronicleWriter();
  const entityWriter = useEntityWriter();
  const chronicleEntityWriter = useChronicleEntityWriter();
  const dynamicShardsWriter = useDynamicShardsWriter();

  /** ANCHOR: Readers */
  const { data: ownProfile } = useOwnProfileReader();
  const { data: allEntities } = useAllEntitiesReader();
  const { data: scopes } = useScope();
  const { data: chronicleCategories } = useChronicleCategory();

  /** ANCHOR: State */
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

        const { category, normalizedSelectedEntities, trimmedTitle, userId } =
          validateChronicleSubmission({
            value: parsedValue,
            userId: ownProfile?.id,
          });

        /** Set defaults for the writers */
        const chronicleWriterWithDefaults = chronicleWriter.setDefaults({
          userId,
        } as any);
        const entityWriterWithDefaults = entityWriter.setDefaults({
          userId,
          isCustom: false,
        } as any);

        const entityOptions = Array.isArray(allEntities)
          ? allEntities
          : allEntities
            ? [allEntities]
            : [];

        const resolvedEntityIds: number[] = [];

        for (const selectedEntity of normalizedSelectedEntities) {
          const candidateId = Number(selectedEntity);

          if (Number.isFinite(candidateId)) {
            resolvedEntityIds.push(candidateId);
            continue;
          }

          const entityDomain = selectedEntity
            .toLowerCase()
            .replace(/^https?:\/\//i, "")
            .replace(/^www\./i, "")
            .split("/")[0]
            ?.trim();

          if (entityDomain) {
            const existing = entityOptions.find(candidate => {
              const domain = String(
                (candidate as Record<string, unknown>).domain ?? "",
              )
                .toLowerCase()
                .trim();

              return domain.length > 0 && domain === entityDomain;
            });

            if (existing) {
              const existingId = toFiniteNumber(
                (existing as Record<string, unknown>).id,
              );

              if (existingId !== null) {
                resolvedEntityIds.push(existingId);
                continue;
              }
            }
          }

          const entityWriteResult = await entityWriterWithDefaults.write({
            name: selectedEntity,
            domain: entityDomain || null,
          } as any);

          const createdEntityId = toFiniteNumber(entityWriteResult.rows[0]?.id);
          if (createdEntityId !== null) {
            resolvedEntityIds.push(createdEntityId);
          }
        }

        const uniqueResolvedEntityIds = Array.from(new Set(resolvedEntityIds));
        const primaryResolvedEntityId = uniqueResolvedEntityIds[0] ?? null;

        const chronicleWriteResult = await chronicleWriterWithDefaults.write({
          title: trimmedTitle,
          description: parsedValue.description.trim() || null,
          category,
          scope: parsedValue.scope,
          knots: parsedValue.knots,
          entityId: primaryResolvedEntityId,
        } as any);

        const createdChronicleId = toFiniteNumber(
          chronicleWriteResult.rows[0]?.id,
        );

        if (createdChronicleId !== null && uniqueResolvedEntityIds.length > 0) {
          await chronicleEntityWriter.write(
            uniqueResolvedEntityIds.map(entityId => ({
              chronicleId: createdChronicleId,
              entityId,
            })),
          );
        }

        if (
          createdChronicleId !== null &&
          typeof vitaId === "number" &&
          Number.isFinite(vitaId)
        ) {
          await dynamicShardsWriter.setDefaults({ vitaId } as any).write({
            id: createdChronicleId,
            chronicleId: createdChronicleId,
            x: 0,
            y: 0,
            prevId: null,
            nextId: null,
          } as any);
        }

        form.reset();
        setSubmitSuccess("Chronicle created successfully.");
      } catch (error) {
        if (error && typeof error === "object") {
          const postgrest = error as {
            message?: string;
            details?: string;
            hint?: string;
            code?: string;
            status?: number;
          };

          if (postgrest.code === "23505" || postgrest.status === 409) {
            setSubmitError(
              postgrest.details ||
                "A chronicle with conflicting values already exists.",
            );
            return;
          }

          if (postgrest.message) {
            if (
              postgrest.message.toLowerCase().includes("row-level security") &&
              postgrest.message.toLowerCase().includes("entities")
            ) {
              setSubmitError(
                "Entity konnte nicht angelegt werden (RLS). Bitte eine bereits vorhandene Company auswählen.",
              );
              return;
            }

            setSubmitError(postgrest.message);
            return;
          }
        }

        setSubmitError("Creating chronicle failed.");
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
