export interface TanstackAuthUser {
  id: string;
}

export interface TanstackClientLike {
  from: (table: string) => any;
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<any>;
}

export interface TanstackAdapter<
  User extends TanstackAuthUser = TanstackAuthUser,
> {
  getUser: (
    client: TanstackClientLike,
  ) => Promise<{ user: User | null; error: unknown }>;
  onAuthStateChange?: (
    client: TanstackClientLike,
    callback: (event: string, user: User | null) => void,
  ) => () => void;
}

let clientFactory: (() => TanstackClientLike) | null = null;
let adapterFactory: (() => TanstackAdapter) | null = null;

export function configureTanstackClient(factory: () => TanstackClientLike) {
  clientFactory = factory;
}

export function configureTanstackAdapter(
  factoryOrAdapter: (() => TanstackAdapter) | TanstackAdapter,
) {
  adapterFactory =
    typeof factoryOrAdapter === "function"
      ? (factoryOrAdapter as () => TanstackAdapter)
      : () => factoryOrAdapter;
}

export function getTanstackClient(): TanstackClientLike {
  if (!clientFactory) {
    throw new Error(
      "Tanstack client is not configured. Call configureTanstackClient(...) before using Reader/Writer.",
    );
  }

  return clientFactory();
}

export function getTanstackAdapter(): TanstackAdapter {
  if (!adapterFactory) {
    throw new Error(
      "Tanstack adapter is not configured. Call configureTanstackAdapter(...) in your project setup.",
    );
  }

  return adapterFactory();
}

export interface RuntimeSchemaEntry {
  Normalize?: { parse: (value: unknown) => unknown };
  Denormalize?: { parse: (value: unknown) => unknown };
}

export type RuntimeSchemas = Record<string, RuntimeSchemaEntry>;

let schemasResolver: (() => Promise<RuntimeSchemas> | RuntimeSchemas) | null =
  null;

export function configureTanstackSchemas(
  resolver: () => Promise<RuntimeSchemas> | RuntimeSchemas,
) {
  schemasResolver = resolver;
}

export async function getTanstackSchemas(): Promise<RuntimeSchemas> {
  if (!schemasResolver) {
    throw new Error(
      "Tanstack schemas are not configured. Call configureTanstackSchemas(...) before using Reader/Writer.",
    );
  }

  return await schemasResolver();
}
