import type { QueryKey } from "@tanstack/react-query";
import type { DbEnumName, DbShape } from "../types";
import type { EnumReader, EnumReaderConfig } from "./types";
import { createEnumReader } from "./createEnumReader";

export class TanstackEnumReaderBuilder<
  DB extends DbShape,
  E extends DbEnumName<DB>,
> {
  private _queryBaseKey?: () => QueryKey;

  constructor(private readonly enumName: E) {}

  baseKey(fn: () => QueryKey): this {
    this._queryBaseKey = fn;
    return this;
  }

  build(): EnumReader<DB, E> {
    const cfg: EnumReaderConfig<E> = {
      enumName: this.enumName,
      queryBaseKey: this._queryBaseKey ?? (() => [this.enumName]),
    };

    return createEnumReader<DB, E>(cfg);
  }
}
