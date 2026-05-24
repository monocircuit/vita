import { createTanstackReader } from "./reader/TanstackReader";
import { createTanstackWriter } from "./writer/TanstackWriter";
import { createTanstackDeleter } from "./deleter/TanstackDeleter";
import type { DbShape, SchemasShape } from "./types";

export {
  configureTanstackClient,
  configureTanstackAdapter,
  getTanstackClient,
  getTanstackAdapter,
  configureTanstackSchemas,
  getTanstackSchemas,
} from "./config";
export type {
  TanstackAdapter,
  TanstackAuthUser,
  TanstackClientLike,
} from "./config";

export * from "./types";
export {
  createTanstackReader,
  createTanstackEnumReader,
  TanstackReaderBuilder,
  TanstackEnumReaderBuilder,
  makeOwn,
  AUTH_LOADING_PLACEHOLDER,
} from "./reader";
export {
  createTanstackWriter,
  TanstackWriterBuilder,
  makeOwnWriter,
} from "./writer";
export { createTanstackDeleter, TanstackDeleterBuilder } from "./deleter";
export type {
  DataReader,
  DataReaderConfig,
  ReaderReturn,
  ArgList,
  SchemaKeyFor,
  NormalizedRowFor,
  EnumReader,
  EnumReaderReturn,
  EnumValuesFor,
  EnumReaderConfig,
} from "./reader";
export type {
  InsertRowFor,
  UpdateRowFor,
  WriteResult,
  WriterConnector,
  WriterConnectorContext,
} from "./writer";
export type {
  DeleteResult,
  DeleterConnector,
  DeleterConnectorContext,
  DeleterInstance,
} from "./deleter";
export {
  emitTanstackMutationEvent,
  subscribeTanstackMutationEvents,
} from "./events";
export type {
  TanstackMutationEvent,
  TanstackMutationEventKind,
} from "./events";

export namespace Tanstack {
  /**
   * Creates a database-bound Tanstack API surface.
   *
   * This mirrors the Bridge pattern:
   * - bind `Database` once
   * - optionally bind app-level `Schemas`
   * - use typed Reader/Writer APIs everywhere else
   */
  export function withDatabase<DB extends DbShape>() {
    return {
      withSchemas<Schemas extends SchemasShape>() {
        return {
          Reader: createTanstackReader<DB, Schemas>(),
          Writer: createTanstackWriter<DB, Schemas>(),
          Deleter: createTanstackDeleter<DB, Schemas>(),
        };
      },
      Reader: createTanstackReader<
        DB,
        Record<string, { Normalized: object }>
      >(),
      Writer: createTanstackWriter<
        DB,
        Record<string, { Normalized: object }>
      >(),
      Deleter: createTanstackDeleter<
        DB,
        Record<string, { Normalized: object }>
      >(),
    };
  }
}
