"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/shared/supabase/client";
import type { DataReader, ReaderReturn } from "./types";

/**
 * Tail<T>: entfernt das erste Element eines Tupels.
 * `Tail<[A, B, C]>` → `[B, C]`
 */
type Tail<T extends readonly unknown[]> = T extends [unknown, ...infer Rest]
  ? Rest
  : [];

/**
 * Placeholder userId used while auth is loading.
 * Queries with this placeholder will be disabled via createDataReader.
 */
export const AUTH_LOADING_PLACEHOLDER = "__auth_loading__";

/**
 * makeOwn: Wraps a `useByUserId(userId, ...rest)` hook so it automatically
 * injects the current authenticated user's id as the first argument.
 *
 * The returned hook accepts the **remaining** parameters (after `userId`)
 * and returns the same result type as the original hook.
 *
 * While the userId is loading, a placeholder is passed and the inner
 * query will be disabled automatically.
 */

// Overload for DataReader with single-row result
export function makeOwn<Row, Args extends [string, ...unknown[]]>(
  useByUserId: DataReader<Row, Args, true>,
): (...args: Tail<Args>) => ReaderReturn<Row, true>;

// Overload for DataReader with multi-row result
export function makeOwn<Row, Args extends [string, ...unknown[]]>(
  useByUserId: DataReader<Row, Args, false | undefined>,
): (...args: Tail<Args>) => ReaderReturn<Row, false | undefined>;

// Overload for any function with (userId: string, ...rest) signature
export function makeOwn<
  F extends (userId: string, ...rest: unknown[]) => unknown,
>(useByUserId: F): (...args: Tail<Parameters<F>>) => ReturnType<F>;

// Implementation
export function makeOwn(
  useByUserId: (...args: [string, ...unknown[]]) => unknown,
): (...args: unknown[]) => unknown {
  return (...rest: unknown[]) => {
    const { data: userId } = useQuery({
      // store the current user id under depot-style key to centralize auth state
      queryKey: ["dpt", "auth", "userId"],
      queryFn: async () => {
        const client = createClient();
        const {
          data: { user },
          error,
        } = await client.auth.getUser();
        if (error) throw error;
        return user?.id ?? null;
      },
      staleTime: 5 * 60_000,
    });

    // Always call the hook (Rules of Hooks), but use placeholder while loading
    const effectiveUserId = userId ?? AUTH_LOADING_PLACEHOLDER;

    return useByUserId(effectiveUserId, ...rest);
  };
}

export default makeOwn;
