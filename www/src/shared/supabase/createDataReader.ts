"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import type {
  ArgList,
  DataReader,
  DataReaderConfig,
  NetQueryFnReturn,
  ReaderReturn,
  SlimmedData,
} from "./types";

import { createClient } from "./client";
import getPrimaryKey from "./getPrimaryKey";
import { snakeToCamelFromObject } from "@/utils/case-conversions/snakeCaseToCamelCase";

export function createDataReader<Row extends object, Args = undefined>(
  config: DataReaderConfig<Row, Args, true>,
): DataReader<Row, Args, true>;

export function createDataReader<Row extends object, Args = undefined>(
  config: DataReaderConfig<Row, Args, false | undefined>,
): DataReader<Row, Args, false | undefined>;

export function createDataReader<
  Row extends object,
  Args = undefined,
  Single extends boolean | undefined = undefined,
>(config: DataReaderConfig<Row, Args, Single>): DataReader<Row, Args, Single> {
  // This is the hook that we will be working with
  return (...selector: ArgList<Args>) => {
    // This code will be executed inside a component
    const queryClient = useQueryClient();

    const queryNetworkKey = () => [
      "net",
      ...config.queryBaseKey(),
      ...config.queryNetworkKey(...selector),
    ];

    const query = useQuery<NetQueryFnReturn<Row>>({
      queryKey: queryNetworkKey(),
      queryFn: async () => {
        console.log("query fire");

        /*
         * Injecting a supabase clientside cient into the fetch function to
         * save on duplicate code.
         */
        const client = createClient();

        /*
         * This is a perfect spot to check if the user is correctly
         * authenticated. This is a part of code that needs to be checked
         * on every fetch.
         */
        const {
          data: { user },
          error: userError,
        } = await client.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No user logged in");

        /* Fetch the data by using the fetcher */
        const fetched = await config.fetch(client, user, ...selector);

        if (!fetched) {
          return null;
        }

        /*
         * If the data has been correctly processed and passed by the fetcher
         * continue to normalize the data array and pass it back to tanstack
         * in order to be put into the cache.
         */
        const data: any[] = [];
        try {
          fetched.forEach(row => {
            data.push(config.dataSchema.parse(row));
          });
        } catch (err) {
          console.error(err);
        }

        console.log("normalized", data);

        /* Should the data not have been processed correctly return null */
        return data;
      },
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    });

    useEffect(() => {
      if (query.data && !(query.data as any)._slim) {
        /*
         * Execute this part of code when the query has fetched new data, that
         * now needs to be put into the cache, using the queryClient.
         */
        /*
         * In order to push through with the atomic cache storage approach, every
         * single row needs to be processed individually.
         */
        for (const row of query.data as Row[]) {
          /*
           * This will calculate the primary key and the depot key for the current
           * row, ultimately determining the spot the data will be stored at in the
           * tanstack logic.
           */
          const primaryKey = getPrimaryKey(row, config.primaryKeyParts);
          const queryDepotKey = [
            "dpt",
            ...config.queryBaseKey(),
            ...config.queryNetworkKey(...selector),
            ...primaryKey,
          ];

          /*
           * Store the row data inside the correct depot key. This is going to be the
           * single source of truth for the data.
           */
          queryClient.setQueryData(queryDepotKey, _old => {
            /*
             * Here the old data that has been stored at the depot key previously can
             * be mutated. I currently have no scenario in mind where this might be
             * helpful in the current way we intent to use tanstack query.
             */
            return row;
          });
        }

        /*
         * Now the algorithm needs to adjust the data that is stored in the network
         * key, since we do not want any duplicate data, it will only store an array
         * of references to the rows that have just been stored inside the depot.
         */
        queryClient.setQueryData(queryNetworkKey(), () => {
          if (query.data) {
            const primaryKeys = [];

            for (const row of query.data as Row[]) {
              primaryKeys.push(getPrimaryKey(row, config.primaryKeyParts));
            }

            return {
              primaryKeys,
              _slim: true,
            };
          }
        });
      }
    }, [query.data]);

    /*
     * At this point the algorithm needs to return the data stored in
     * each corresponding deposit query key.
     */
    let data = queryClient.getQueryData(queryNetworkKey());

    if (data && (data as SlimmedData<Row>)._slim) {
      const primaryKeys = (data as SlimmedData<Row>).primaryKeys;

      const rows = [];

      for (const primaryKey of primaryKeys) {
        const queryDepotKey = [
          "dpt",
          ...config.queryBaseKey(),
          ...config.queryNetworkKey(...selector),
          ...primaryKey,
        ];
        const row = queryClient.getQueryData(queryDepotKey);

        if (!row)
          throw new Error("Data Leak; Deposit Key holds no Information");

        rows.push(row);
      }

      data = config.isSingleRow ? rows[0] : rows;
    }

    return { ...query, data } as ReaderReturn<Row, Single>;
  };
}
