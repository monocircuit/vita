"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getTanstackAdapter, getTanstackClient } from "../config";
import type { DataReader, ReaderReturn } from "./types";

type Tail<T extends readonly unknown[]> = T extends [unknown, ...infer Rest]
  ? Rest
  : [];

export const AUTH_LOADING_PLACEHOLDER = "__auth_loading__";
const AUTH_USER_ID_QUERY_KEY = ["dpt", "auth", "userId"] as const;

export function makeOwn<Row, Args extends [string, ...unknown[]]>(
  useByUserId: DataReader<Row, Args, true>,
): (...args: Tail<Args>) => ReaderReturn<Row, true>;

export function makeOwn<Row, Args extends [string, ...unknown[]]>(
  useByUserId: DataReader<Row, Args, false | undefined>,
): (...args: Tail<Args>) => ReaderReturn<Row, false | undefined>;

export function makeOwn<
  F extends (userId: string, ...rest: unknown[]) => unknown,
>(useByUserId: F): (...args: Tail<Parameters<F>>) => ReturnType<F>;

export function makeOwn(
  useByUserId: (...args: [string, ...unknown[]]) => unknown,
): (...args: unknown[]) => unknown {
  return (...rest: unknown[]) => {
    const queryClient = useQueryClient();

    useEffect(() => {
      const client = getTanstackClient();
      const adapter = getTanstackAdapter();

      if (!adapter.onAuthStateChange) {
        return;
      }

      const unsubscribe = adapter.onAuthStateChange(client, (_event, user) => {
        queryClient.setQueryData(AUTH_USER_ID_QUERY_KEY, user?.id ?? null);
      });

      return () => {
        unsubscribe();
      };
    }, [queryClient]);

    const { data: userId } = useQuery({
      queryKey: AUTH_USER_ID_QUERY_KEY,
      queryFn: async () => {
        const client = getTanstackClient();
        const adapter = getTanstackAdapter();
        const { user, error } = await adapter.getUser(client);
        if (error) throw error;
        return user?.id ?? null;
      },
      staleTime: 5 * 60_000,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    });

    const effectiveUserId =
      userId === undefined ? AUTH_LOADING_PLACEHOLDER : (userId ?? "");

    return useByUserId(effectiveUserId, ...rest);
  };
}

export default makeOwn;
