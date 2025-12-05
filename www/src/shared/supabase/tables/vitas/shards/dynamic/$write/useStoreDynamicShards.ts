import { TanstackWriter } from "@/shared/tanstack/writer";

/**
 * Writer hook for storing dynamic vita shards.
 *
 * Uses TanstackWriter API:
 * - Automatically handles denormalization/normalization
 * - Manages cache invalidation
 * - Supports insert and update based on primary key presence
 */
const useStoreDynamicShards = TanstackWriter.create("vitas_shards_dynamic")
  .primaryKeyParts("vitaId", "id")
  .baseKey(() => ["vitas", "shards", "dynamic"])
  .build();

export default useStoreDynamicShards;
