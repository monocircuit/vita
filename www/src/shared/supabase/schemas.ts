import { Bridge } from "@/shared/bridge";
import { chronicles } from "./tables/chronicles";

export const $Schemas = await Bridge.Registry.create()
  .add(Bridge.Table.create("vitas"))
  .add(Bridge.Table.create("vitas_shards_dynamic"))
  .add(
    Bridge.Table.create("profiles")
      .column("dayOfBirth")
      .normalize(v => (v ? new Date(v) : null))
      .denormalize(v => (v ? v.toISOString() : null)),
  )
  .add(chronicles)
  .build();

export type Schemas = Bridge.Infer<typeof $Schemas>;
