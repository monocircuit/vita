import type { QueryKey, UseQueryResult } from "@tanstack/react-query";
import type { ZodType } from "zod";
import type {
  DbEnumName,
  DbInsert,
  DbShape,
  DbTableName,
  DbUpdate,
  SchemasShape,
} from "../types";
import type {
  Camelize,
  Pascalize,
  Snakeize,
} from "@/vendor/utilities/functions";
import type { TanstackAuthUser, TanstackClientLike } from "../config";

export type FetchResult<T> = Promise<T[] | null>;

export interface SlimmedData<Row> {
  primaryKeys: Row[keyof Row][][];
  _slim: true;
}

export type NetQueryFnReturn<Row> = Row[] | null | SlimmedData<Row>;

export interface ArgsOptions {
  enabled?: boolean;
}

export type ArgList<Selector> = [Selector] extends [undefined]
  ? []
  : Selector extends any[]
    ? [...Selector, options?: ArgsOptions]
    : [Selector, options?: ArgsOptions];

export type SchemaKeyFor<
  Table extends string,
  Schemas extends SchemasShape,
> = `${Pascalize<Table>}` & keyof Schemas;

export type NormalizedRowFor<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
> = Schemas[SchemaKeyFor<Table, Schemas>]["Normalized"] & object;

export type ReaderReturn<
  Row,
  Single extends boolean | undefined,
> = UseQueryResult<Single extends true ? Row : Row[], Error>;

export type DataReader<
  Row,
  Args = undefined,
  Single extends boolean | undefined = undefined,
> = (...args: ArgList<Args>) => ReaderReturn<Row, Single>;

export interface DataReaderConfig<
  Row extends object,
  Selector = undefined,
  Single extends boolean | undefined = undefined,
> {
  fetch: (
    client: TanstackClientLike,
    user: TanstackAuthUser,
    ...selector: ArgList<Selector>
  ) => FetchResult<Record<string, unknown>>;
  normalizer:
    | ZodType<Row, any>
    | (() => ZodType<Row, any> | Promise<ZodType<Row, any>>);
  isSingleRow?: Single;
  primaryKeyParts: (keyof Row)[];
  queryBaseKey: () => QueryKey;
  queryNetworkKey: (...selector: ArgList<Selector>) => QueryKey;
}

export type CamelizedEnumName<DB extends DbShape> = Camelize<
  DbEnumName<DB> & string
>;

export type ToSnakeEnum<DB extends DbShape, T extends string> =
  Snakeize<T> extends DbEnumName<DB> ? Snakeize<T> : never;

export type EnumValuesFor<
  DB extends DbShape,
  E extends DbEnumName<DB>,
> = DB["public"]["Enums"][E];

export type EnumReaderReturn<
  DB extends DbShape,
  E extends DbEnumName<DB>,
> = UseQueryResult<EnumValuesFor<DB, E>[], Error>;

export type EnumReader<
  DB extends DbShape,
  E extends DbEnumName<DB>,
> = () => EnumReaderReturn<DB, E>;

export interface EnumReaderConfig<E extends string> {
  enumName: E;
  queryBaseKey: () => QueryKey;
}

export interface DataWriterConfig<Row extends object> {
  schema: ZodType<any, any>;
  mutate: (rows: Record<string, unknown>[]) => Promise<void>;
  denormalize: (row: Row) => Record<string, unknown>;
}

export type RawRowFor<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DB["public"]["Tables"][Table]["Row"];

export type InsertRowFor<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DbInsert<DB, Table>;

export type UpdateRowFor<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DbUpdate<DB, Table>;
