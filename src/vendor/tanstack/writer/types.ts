"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type { Pascalize } from "@/vendor/utilities/functions";
import type {
  DbInsert,
  DbShape,
  DbTableName,
  DbUpdate,
  SchemasShape,
} from "../types";
import type { TanstackClientLike } from "../config";
import type { TanstackAuthUser } from "../config";

export type SchemaKeyFor<
  Table extends string,
  Schemas extends SchemasShape,
> = `${Pascalize<Table>}` & keyof Schemas;

export type NormalizedRowFor<
  DB extends DbShape,
  Schemas extends SchemasShape,
  Table extends DbTableName<DB>,
> = Schemas[SchemaKeyFor<Table, Schemas>]["Normalized"] & object;

export type InsertRowFor<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DbInsert<DB, Table>;

export type UpdateRowFor<
  DB extends DbShape,
  Table extends DbTableName<DB>,
> = DbUpdate<DB, Table>;

export interface WriteResult<Row> {
  rows: Row[];
}

export interface WriterInstance<
  CamelInsert extends object,
  CamelRow extends object,
  Defaults extends Partial<CamelInsert>,
> {
  write: (
    input:
      | (Omit<CamelInsert, keyof Defaults> & Partial<Defaults>)
      | (Omit<CamelInsert, keyof Defaults> & Partial<Defaults>)[],
  ) => Promise<WriteResult<CamelRow>>;
  mutation: UseMutationResult<WriteResult<CamelRow>, Error, unknown[], unknown>;
  setDefaults: <NewDefaults extends Partial<CamelInsert>>(
    newDefaults: NewDefaults,
  ) => WriterInstance<CamelInsert, CamelRow, Defaults & NewDefaults>;
}

export interface WriterConnectorContext<Table extends string> {
  client: TanstackClientLike;
  user: TanstackAuthUser;
  tableName: Table;
  rows: Record<string, unknown>[];
  primaryKeyParts: string[];
  conflictParts: string[];
}

export type WriterConnector<Table extends string> = (
  context: WriterConnectorContext<Table>,
) => Promise<Record<string, unknown>[] | null>;

export type WriterReturn<Row> = UseMutationResult<
  WriteResult<Row>,
  Error,
  unknown[],
  unknown
>;
