import { Bridge, configureBridgeClient } from "@/vendor/bridge";
import { createClient } from "./client";
import type { Database } from "../../../database";

configureBridgeClient(() => createClient() as any);

const SupabaseBridge = Bridge.withDatabase<Database>();

function toLinearChronicles<T extends { knots: number[]; id: number | string }>(
  chronicle: T,
) {
  type LinearChronicle = Overwrite<
    T,
    { knots: { start: number; end: number } }
  >;
  const linearChronicles: LinearChronicle[] = [];

  if (!chronicle.knots || chronicle.knots.length === 0) return linearChronicles;

  if (chronicle.knots.length === 2) {
    linearChronicles.push({
      ...chronicle,
      knots: {
        start: chronicle.knots[0],
        end: chronicle.knots[1],
      },
    });
    return linearChronicles;
  }

  let i = 0;
  while (i < chronicle.knots.length - 1) {
    linearChronicles.push({
      ...chronicle,
      knots: {
        start: chronicle.knots[i],
        end: chronicle.knots[i + 1],
      },
    });
    i += 2;
  }

  if (i === chronicle.knots.length - 1) {
    const start = chronicle.knots[i];
    const now = Date.now();
    linearChronicles.push({
      ...chronicle,
      knots: {
        start,
        end: Math.max(now, start),
      },
    });
  }

  return linearChronicles;
}

const entities = SupabaseBridge.Table.create("entities");

const chronicleEntities = SupabaseBridge.Table.create("chronicle_entities");

const chronicles = SupabaseBridge.Table.create("chronicles")
  .column("knots")
  .normalize(knots => knots.map(knot => new Date(knot).getTime()))
  .denormalize(knots => knots.map(knot => new Date(knot).toISOString()))
  .mutations({
    untied: {
      removedKeys: ["knots"],
    },
    linear: {
      to: chronicle => toLinearChronicles(chronicle),
      from: segments => {
        if (!segments || segments.length === 0) {
          throw new Error(
            "Cannot reconstruct Chronicle from empty LinearChronicle[]",
          );
        }

        const base = segments[0];
        const allKnots: number[] = [];
        for (const seg of segments) {
          allKnots.push(seg.knots.start);
          if (Number.isFinite(seg.knots.end)) {
            allKnots.push(seg.knots.end as number);
          }
        }

        return {
          ...base,
          knots: allKnots,
        };
      },
    },
    engine: {
      to: chronicle => {
        // Use the extracted function directly to avoid circular $Schemas reference
        const linears = toLinearChronicles(chronicle);
        return linears.map(linear => ({ knots: linear.knots, id: linear.id }));
      },
    },
  });

const schemasPromise = SupabaseBridge.Registry.create()
  .add(SupabaseBridge.Table.create("vitas"))
  .add(SupabaseBridge.Table.create("vitas_shards_dynamic"))
  .add(entities)
  .add(chronicleEntities)
  .add(
    SupabaseBridge.Table.create("profiles")
      .column("dayOfBirth")
      .normalize(v => (v ? new Date(v) : null))
      .denormalize(v => (v ? v.toISOString() : null)),
  )
  .add(chronicles)
  .build();

export const $Schemas = await schemasPromise;

export type Schemas = Bridge.Infer<typeof $Schemas>;
