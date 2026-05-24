import { TanstackWriter } from "@/shared/data/tanstack";

/**
 * Writer hook for storing dynamic vita shards.
 *
 * Uses TanstackWriter API:
 * - Automatically handles denormalization/normalization
 * - Manages cache invalidation
 * - Supports insert and update based on primary key presence
 */
const dynamicShardsTable = TanstackWriter.table("vitas_shards_dynamic", {
  primaryKeyParts: ["vitaId", "id"],
  baseKey: () => ["vitas", "shards", "dynamic"],
});

const useDynamicShardsWriter = TanstackWriter.on(dynamicShardsTable).build();

export default useDynamicShardsWriter;
