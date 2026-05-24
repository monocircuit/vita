import type { AnyTableBuilder } from "../table";
import type { MapFromBuilders } from "./types";

/**
 * Builder registry for composing multiple table builders into one schema map.
 *
 * The registry keeps insertion order and merges each built table object into
 * a single final record.
 */
export class Registry<TBuilders extends readonly AnyTableBuilder[] = []> {
  private constructor(private readonly builders: TBuilders) {}

  /** Creates an empty registry instance. */
  static create() {
    return new Registry([] as const);
  }

  /**
   * Adds a table builder to the registry and returns a new typed registry.
   */
  add<B extends AnyTableBuilder>(builder: B): Registry<[...TBuilders, B]> {
    return new Registry<[...TBuilders, B]>([...this.builders, builder] as any);
  }

  /**
   * Builds all registered table schemas and returns a merged map.
   */
  async build(): Promise<MapFromBuilders<TBuilders>> {
    const result: any = {};

    for (const b of this.builders) {
      const partial = await b.build();
      Object.assign(result, partial);
    }

    return result;
  }
}

export default Registry;
