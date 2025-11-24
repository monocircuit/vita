/*
 * Export all readers
 */
export { default as useDynamicShardsByVitaId } from "./$read/useDynamicShardsByVitaId";

/*
 * Export all writers
 */
export { default as useStoreDynamicShards } from "./$write/useStoreDynamicShards";

/*
 * Export all types
 */
export type {
  iTDynamicShard as iTVitaShardDynamic,
  oTDynamicShard as oTVitaShardDynamic,
} from "./map";

/*
 * Export all schemas
 */
export {
  nw$DynamicShard as i$VitaShardDynamic,
  $DynamicShard_normalized_read as o$VitaShardDynamic,
} from "./map";
