"use client";
import { FreeNoteData } from "@/shared/drawing/dynamic/drawDraggableNote";
import Renderer from "@/shared/drawing/dynamic/Renderer";
import { BranchStyle } from "@/shared/drawing/dynamic/styleApi";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";
import { $Schemas } from "@/shared/data/schemas";
import { useChroniclesByVitaIdReader } from "@/shared/data/tables/chronicles";
import { useAllChronicleEntitiesReader } from "@/shared/data/tables/chronicleEntities";
import { useAllEntitiesReader } from "@/shared/data/tables/entities";
import { NormalizedRowFor } from "@/shared/data/tanstack";
import { useDynamicShardsWriter } from "@/shared/data/tables/vitas/shards/dynamic";
import { createClient } from "@/shared/data/client";
import useTanstackMutationAddressSubscriber from "../hooks/useTanstackMutationAddressSubscriber";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = { vitaId: number };

function EditorWorkspace({ vitaId }: Props) {
  /** ANCHOR: Fetched Data */
  const ownChroniclesQuery = useChroniclesByVitaIdReader(String(vitaId));
  const chronicleEntityRelationsQuery = useAllChronicleEntitiesReader();
  const entitiesQuery = useAllEntitiesReader();

  const { data: ownChronicles } = ownChroniclesQuery;
  const { data: chronicleEntityRelations } = chronicleEntityRelationsQuery;
  const { data: entities } = entitiesQuery;
  const dynamicShardsWriter = useDynamicShardsWriter();
  const [notes, setNotes] = useState<FreeNoteData[]>([]);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const lastChronicleIdsRef = useRef<string | null>(null);
  const isRebuildingRef = useRef(false);
  const pendingRebuildRef = useRef(false);

  const normalizedChronicles = useMemo(() => {
    const list = Array.isArray(ownChronicles)
      ? ownChronicles
      : ownChronicles
        ? [ownChronicles]
        : [];

    return list.filter(
      (chronicle): chronicle is NormalizedRowFor<"chronicles"> =>
        Boolean(chronicle) && typeof chronicle === "object",
    );
  }, [ownChronicles]);

  /** ANCHOR: Engines */
  const engine = useEngine();

  useEffect(() => {
    if (normalizedChronicles.length === 0 || engine.loaded) return;

    let isCancelled = false;
    void (async () => {
      try {
        if (isCancelled) return;

        setSchemaError(null);
        engine.init(
          $Schemas.Chronicles.Mutations.Engine.To.parse(normalizedChronicles),
        );
      } catch (error) {
        if (isCancelled) return;
        setSchemaError(
          error instanceof Error
            ? error.message
            : "Failed to load schema metadata",
        );
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [engine, normalizedChronicles]);

  const branchStyles = useMemo(
    () =>
      new Map<string, BranchStyle>([
        ["101", { color: 0xff0020, thickness: 6 }],
      ]),
    [],
  );

  const chroniclesAddressPrefix = useMemo(
    () => ["net", "public", "chronicles"] as const,
    [],
  );

  const chronicleList = normalizedChronicles;
  const isRendererDataLoading =
    ownChroniclesQuery.isLoading ||
    ownChroniclesQuery.isFetching ||
    chronicleEntityRelationsQuery.isLoading ||
    chronicleEntityRelationsQuery.isFetching ||
    entitiesQuery.isLoading ||
    entitiesQuery.isFetching;

  const entitiesByChronicleId = useMemo(() => {
    const toNumber = (value: unknown): number | null => {
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    };

    const relationList = Array.isArray(chronicleEntityRelations)
      ? chronicleEntityRelations
      : chronicleEntityRelations
        ? [chronicleEntityRelations]
        : [];
    const entityList = Array.isArray(entities)
      ? entities
      : entities
        ? [entities]
        : [];

    const entityById = new Map<number, NormalizedRowFor<"entities">>();
    entityList.forEach(entity => {
      if (!entity) return;
      const entityId = toNumber((entity as Record<string, unknown>).id);
      if (entityId !== null) {
        entityById.set(entityId, entity);
      }
    });

    const map = new Map<string, NormalizedRowFor<"entities">[]>();

    relationList.forEach(relation => {
      const relationRecord = relation as Record<string, unknown>;
      const chronicleId = toNumber(
        relationRecord.chronicleId ?? relationRecord.chronicle_id,
      );
      const entityId = toNumber(
        relationRecord.entityId ?? relationRecord.entity_id,
      );

      if (chronicleId === null || entityId === null) return;

      const joinedEntity = relationRecord.entity;
      const entity =
        entityById.get(entityId) ??
        (joinedEntity && typeof joinedEntity === "object"
          ? (joinedEntity as NormalizedRowFor<"entities">)
          : undefined);
      if (!entity) return;

      const key = String(chronicleId);
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, entity]);
    });

    return map;
  }, [chronicleEntityRelations, entities]);

  const chronicleIdsSignature = useMemo(() => {
    const ids = normalizedChronicles
      .map(chronicle => chronicle.id)
      .filter((id): id is number => Number.isFinite(id))
      .sort((a, b) => a - b);

    return ids.join(",");
  }, [normalizedChronicles]);

  const rebuildGraphAndPersistShards = useCallback(async () => {
    if (!Number.isFinite(vitaId)) return;
    if (isRebuildingRef.current) {
      pendingRebuildRef.current = true;
      return;
    }

    isRebuildingRef.current = true;

    try {
      do {
        pendingRebuildRef.current = false;

        const engineChronicles = normalizedChronicles.length
          ? $Schemas.Chronicles.Mutations.Engine.To.parse(normalizedChronicles)
          : [];

        engine.init(engineChronicles, true);

        const shards = engine.toShards();
        const client = createClient();

        const { error: cleanupError } = await client
          .from("vitas_shards_dynamic")
          .delete()
          .eq("vita_id", vitaId);

        if (cleanupError) throw cleanupError;

        if (shards.length > 0) {
          await dynamicShardsWriter.setDefaults({ vitaId }).write(shards);
        }
      } while (pendingRebuildRef.current);
    } catch (error) {
      setSchemaError(
        error instanceof Error
          ? error.message
          : "Failed to rebuild graph and persist shards",
      );
    } finally {
      isRebuildingRef.current = false;
    }
  }, [dynamicShardsWriter, engine, normalizedChronicles, vitaId]);

  useTanstackMutationAddressSubscriber({
    addressPrefix: chroniclesAddressPrefix,
    onMatch: rebuildGraphAndPersistShards,
    debounceMs: 150,
  });

  useEffect(() => {
    if (ownChroniclesQuery.isLoading || ownChroniclesQuery.isFetching) return;
    if (chronicleIdsSignature === lastChronicleIdsRef.current) {
      return;
    }

    lastChronicleIdsRef.current = chronicleIdsSignature;
    void rebuildGraphAndPersistShards();
  }, [
    chronicleIdsSignature,
    rebuildGraphAndPersistShards,
    ownChroniclesQuery.isLoading,
    ownChroniclesQuery.isFetching,
  ]);

  const handleNoteMove = (id: string, x: number, y: number) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, x, y } : n)));
  };

  const handleCreateNote = (x: number, y: number) => {
    const newNote: FreeNoteData = {
      id: Math.random().toString(36).substr(2, 9),
      content: "Neue Notiz",
      x,
      y,
    };
    setNotes(prev => [...prev, newNote]);
  };

  return (
    <>
      {schemaError ? (
        <div className="p-2 text-xs text-red-400" role="alert">
          {`Schema load failed: ${schemaError}`}
        </div>
      ) : null}
      <Renderer
        engine={engine}
        chronicles={chronicleList}
        entitiesByChronicleId={entitiesByChronicleId}
        branchStyles={branchStyles}
        isDataLoading={isRendererDataLoading}
        onNoteMove={handleNoteMove}
        onCanvasDoubleTap={handleCreateNote}
        notes={notes}
      ></Renderer>
    </>
  );
}

export default EditorWorkspace;
