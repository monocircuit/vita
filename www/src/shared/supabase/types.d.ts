import { UseQueryResult } from "@tanstack/react-query";

/**
 * @author Lukas Diegelmann
 *
 * In case no user is logged in, the fetcher will return null. In
 * case no data is found the fetcher will return an empty array.
 */
type FetchResult<T> = Promise<T[] | null>;

interface SlimmedData<Row> {
  primaryKeys: Row[keyof Row][][];
  _slim: true;
}

/**
 * @author Lukas Diegelmann
 *
 * This is type that a queryFn can return when the queryFn is defined
 * in a network query. This does not apply to deposit queries.
 */
type NetQueryFnReturn<Row> = Row[] | null | SlimmedData<Row>;

type ArgList<Selector> = [Selector] extends [undefined]
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
type ReaderReturn<Row, Single extends boolean | undefined> = UseQueryResult<
  Single extends true ? Row : Row[],
  Error
>;

export type DataReader<
  Row,
  Args = undefined,
  Single extends boolean | undefined = undefined,
> = (...args: ArgList<Args>) => ReaderReturn<Row, Single>;
