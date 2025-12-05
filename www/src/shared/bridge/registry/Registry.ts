import type { AnyTableBuilder } from "@/shared/bridge/table";
import type { MapFromBuilders } from "@/shared/bridge/registry";

export class Registry<TBuilders extends readonly AnyTableBuilder[] = []> {
  private constructor(private readonly builders: TBuilders) {}

  static create() {
    return new Registry([] as const);
  }

  add<B extends AnyTableBuilder>(builder: B): Registry<[...TBuilders, B]> {
    return new Registry<[...TBuilders, B]>([...this.builders, builder] as any);
  }

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
