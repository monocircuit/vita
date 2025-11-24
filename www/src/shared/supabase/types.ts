import { User } from "@supabase/supabase-js";
import { QueryKey, UseQueryResult } from "@tanstack/react-query";
import { createClient } from "./client";
import { ZodEffects, ZodSchema } from "zod";

/**
 * @author Lukas Diegelmann
 *
 * In case no user is logged in, the fetcher will return null. In
 * case no data is found the fetcher will return an empty array.
 */
export type FetchResult<T> = Promise<T[] | null>;

/**
 * @author Lukas Diegelmann
 *
 * This is a slimmed down version of data that can be returned
 * by a network query function in order to reduce data duplication.
 */
export interface SlimmedData<Row> {
  primaryKeys: Row[keyof Row][][];
  _slim: true;
}

/**
 * @author Lukas Diegelmann
 *
 * This is type that a queryFn can return when the queryFn is defined
 * in a network query. This does not apply to deposit queries.
 */
export type NetQueryFnReturn<Row> = Row[] | null | SlimmedData<Row>;

export type ArgList<Selector> = [Selector] extends [undefined]
  ? [] // no selector → no args
  : Selector extends any[]
    ? Selector // tuple → same tuple
    : [Selector]; // single type → one arg

/**
 * @author Lukas Diegelmann
 *
 * A DataReader is a React Hook that connects to supabase in order
 * to fetch data. Caching is handled by tanstack query.
 */
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
    client: Awaited<ReturnType<typeof createClient>>,
    user: User,
    ...selector: ArgList<Selector>
  ) => FetchResult<Record<string, unknown>>; // your FetchResult<...> here

  dataSchema: ZodEffects<any, any, any>;

  isSingleRow?: Single;

  primaryKeyParts: (keyof Row)[];
  queryBaseKey: () => QueryKey;
  queryNetworkKey: (...selector: ArgList<Selector>) => QueryKey;
}

export interface DataWriterConfig<Row extends object> {
  schema: ZodSchema;

  mutate: (rows: Row[]) => Promise<void>;

  denormalize: (row: Row) => Record<string, unknown>;
}

export interface Bridge {
  toApp: <Row>(
    rawRows: Record<string, unknown>[],
    schema: ZodSchema,
  ) => Error | null | Row[];
  toDatabase: <Row>(
    normalizedRows: Record<string, unknown>[],
  ) => Error | null | Row[];
}
