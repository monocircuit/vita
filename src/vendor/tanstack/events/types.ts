import type { QueryKey } from "@tanstack/react-query";

export type TanstackMutationEventKind = "write-success" | "delete-success";

export interface TanstackMutationEvent {
  kind: TanstackMutationEventKind;
  tableName: string;
  queryBaseKey: string[];
  address: QueryKey;
  primaryKeyParts: string[];
  rows: Record<string, unknown>[];
  occurredAt: number;
}
