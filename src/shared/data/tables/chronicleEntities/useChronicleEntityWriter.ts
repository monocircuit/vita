import { TanstackWriter } from "@/shared/data/tanstack";

/**
 * Writer hook for storing chronicle-entity links (junction table).
 */
const chronicleEntitiesTable = TanstackWriter.table(
  "chronicle_entities" as any,
  {
    primaryKeyParts: ["id" as any],
    baseKey: () => ["chronicleEntities"],
  },
);

const useChronicleEntityWriter = TanstackWriter.on(
  chronicleEntitiesTable,
).build();

export default useChronicleEntityWriter;
