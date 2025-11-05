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
} from "./mapping";

/*
 * Export all schemas
 */
export {
  i$DynamicShard as i$VitaShardDynamic,
  o$DynamicShard as o$VitaShardDynamic,
} from "./mapping";
