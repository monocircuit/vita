// src/utils/tanstack/NetCache.ts
import { QueryClient, QueryKey } from "@tanstack/react-query";

/**
 * @author ChatGPT5
 *
 * A thin object-oriented cache that stores slim "ID lists" for network queries.
 * Each instance manages a specific `netKey` inside React Query.
 *
 * It is designed to work alongside a BaseCache (which stores the actual rows).
 * The NetCache only stores *references* (IDs) to those rows.
 */
export class NetCache {
  private queryClient: QueryClient;
  private queryKey: QueryKey;

  constructor(queryClient: QueryClient, queryKey: QueryKey) {
    this.queryClient = queryClient;
    this.queryKey = queryKey;
  }

  /** The shape stored in the React Query store. */
  private static wrap(ids: string[]): NetCache.Slim {
    return { _slim: true, ids };
  }

  /** Read the current slim entry (if any) from the QueryClient. */
  public read(): NetCache.Slim | null {
    const value = this.queryClient.getQueryData<NetCache.Slim | null>(
      this.queryKey,
    );
    if (value && value._slim) return value;
    return null;
  }

  /** Returns the current IDs array or `null` if none exist. */
  public getIds(): string[] | null {
    const slim = this.read();
    return slim?.ids ?? null;
  }

  /** Write or overwrite the slim entry for this key. */
  public write(ids: string[]): void {
    this.queryClient.setQueryData(this.queryKey, NetCache.wrap(ids));
  }

  /** Append IDs (deduped) to the existing slim entry. */
  public append(ids: string[]): void {
    const existing = this.getIds() ?? [];
    const set = new Set([...existing, ...ids]);
    this.write(Array.from(set));
  }

  /** Remove specific IDs from the existing slim entry. */
  public remove(ids: string[]): void {
    const existing = this.getIds() ?? [];
    const next = existing.filter(id => !ids.includes(id));
    this.write(next);
  }

  /** Clear the slim entry completely. */
  public clear(): void {
    this.queryClient.removeQueries({ queryKey: this.queryKey });
  }

  /** Convenience: check whether an ID is contained. */
  public has(id: string): boolean {
    return this.getIds()?.includes(id) ?? false;
  }
}

export namespace NetCache {
  export interface Slim {
    _slim: true;
    ids: string[];
  }
}
