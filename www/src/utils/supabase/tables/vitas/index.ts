/* Export Mapping */
export { o$Vita as $Vita } from "./mapping";
export type { oTVita as TVita } from "./mapping";

/* Export CRUD Operations */
export {
  vitaBaseKey,
  useReadAllVitas,
  useReadOwnVitas,
  useReadVitasByName,
  useReadVitasByType,
  useReadVitasByUser,
} from "./$read";
export type { IVitaCache } from "./$read";
