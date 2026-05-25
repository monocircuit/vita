"use client";
import { FreeNoteData } from "@/shared/drawing/dynamic/drawDraggableNote";
import Renderer from "@/shared/drawing/dynamic/Renderer";
import { BranchStyle } from "@/shared/drawing/dynamic/styleApi";
import useEngine from "@/shared/processing/engines/dynamic/useEngine";
import { chroniclesToEngineSegments } from "@/shared/processing/data/chronicles/chroniclesToEngineSegments";
import {
  useChroniclesByVitaIdReader,
  useChronicleEntitiesReader,
  useEntitiesReader,
  useReplaceShardsForVita,
} from "@/shared/data/local";
import type { ChronicleView } from "../../../../electron/ipc/contracts";
import type { Entity } from "../../../../electron/db/schema";
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
  const ownChroniclesQuery = useChroniclesByVitaIdReader(vitaId);
  const chronicleEntityRelationsQuery = useChronicleEntitiesReader();
  const entitiesQuery = useEntitiesReader();
  const replaceShards = useReplaceShardsForVita();

  const { data: ownChronicles } = ownChroniclesQuery;
  const { data: chronicleEntityRelations } = chronicleEntityRelationsQuery;
  const { data: entities } = entitiesQuery;
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
      (chronicle): chronicle is ChronicleView =>
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
          chroniclesToEngineSegments(normalizedChronicles),
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

  const chronicleList = normalizedChronicles;
  const isRendererDataLoading =
    ownChroniclesQuery.isLoading ||
    ownChroniclesQuery.isFetching ||
    chronicleEntityRelationsQuery.isLoading ||
    chronicleEntityRelationsQuery.isFetching ||
    entitiesQuery.isLoading ||
    entitiesQuery.isFetching;

  const entitiesByChronicleId = useMemo(() => {
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

    const entityById = new Map<number, Entity>();
    entityList.forEach(entity => {
      if (!entity) return;
      if (Number.isFinite(entity.id)) {
        entityById.set(entity.id, entity);
      }
    });

    const map = new Map<string, Entity[]>();

    relationList.forEach(relation => {
      if (!relation) return;
      const { chronicleId, entityId } = relation;
      if (!Number.isFinite(chronicleId) || !Number.isFinite(entityId)) return;

      const entity = entityById.get(entityId);
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
          ? chroniclesToEngineSegments(normalizedChronicles)
          : [];

        engine.init(engineChronicles, true);

        const shards = engine.toShards();
        await replaceShards.mutateAsync({
          vitaId,
          shards: shards.map((s: { chronicleId: number; x: number; y: number; prevId?: number | null; nextId?: number | null }) => ({
            chronicleId: s.chronicleId,
            x: s.x,
            y: s.y,
            prevId: s.prevId ?? null,
            nextId: s.nextId ?? null,
          })),
        });
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
  }, [engine, normalizedChronicles, replaceShards, vitaId]);

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
