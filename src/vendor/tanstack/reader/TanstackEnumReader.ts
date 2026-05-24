import { toSnakeCase } from "@/vendor/utilities/functions";
import type { DbShape } from "../types";
import { TanstackEnumReaderBuilder } from "./TanstackEnumReaderBuilder";
import type { CamelizedEnumName, ToSnakeEnum } from "./types";

export function createTanstackEnumReader<DB extends DbShape>() {
  return class TanstackEnumReader {
    static create<CamelEnum extends CamelizedEnumName<DB>>(
      enumName: CamelEnum,
    ): TanstackEnumReaderBuilder<DB, ToSnakeEnum<DB, CamelEnum>> {
      const snakeEnumName = toSnakeCase(enumName) as ToSnakeEnum<DB, CamelEnum>;
      return new TanstackEnumReaderBuilder<DB, ToSnakeEnum<DB, CamelEnum>>(
        snakeEnumName,
      );
    }
  };
}
