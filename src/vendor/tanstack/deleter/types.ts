"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type { DbShape, DbTableName, SchemasShape } from "../types";
import type { TanstackAuthUser, TanstackClientLike } from "../config";
import type { NormalizedRowFor } from "../writer";

export interface DeleteResult<Row> {
  rows: Row[];
}

export type DeleteInput<
  CamelRow extends object,
  RequiredKeys extends keyof CamelRow,
> = Pick<CamelRow, RequiredKeys> & Partial<CamelRow>;

export interface DeleterInstance<
  CamelRow extends object,
  Defaults extends Partial<CamelRow>,
  RequiredKeys extends keyof CamelRow = never,
> {
  delete: (
    input:
      | DeleteInput<CamelRow, RequiredKeys>
      | DeleteInput<CamelRow, RequiredKeys>[],
  ) => Promise<DeleteResult<CamelRow>>;
  mutation: UseMutationResult<
    DeleteResult<CamelRow>,
    Error,
    DeleteInput<CamelRow, RequiredKeys>[],
    unknown
  >;
  setDefaults: <NewDefaults extends Partial<CamelRow>>(
    newDefaults: NewDefaults,
  ) => DeleterInstance<CamelRow, Defaults & NewDefaults, RequiredKeys>;
}

export interface DeleterConnectorContext<Table extends string> {
  client: TanstackClientLike;
  user: TanstackAuthUser;
  tableName: Table;
  rows: Record<string, unknown>[];
  primaryKeyParts: string[];
}

export type DeleterConnector<Table extends string> = (
  context: DeleterConnectorContext<Table>,
) => Promise<Record<string, unknown>[] | null>;

export type DeleteRowFor<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
> = NormalizedRowFor<DB, Schemas, Table>;

export interface DeleterTableConfig<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
  PrimaryKey extends keyof NormalizedRowFor<DB, Schemas, Table> & string =
    keyof NormalizedRowFor<DB, Schemas, Table> & string,
> {
  tableName: Table;
  primaryKeyParts: PrimaryKey[];
  baseKey?: () => string[];
}
