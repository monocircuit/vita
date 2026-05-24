/**
 * Minimal client contract required by the bridge package.
 *
 * The bridge only needs RPC access to fetch table metadata. Host applications
 * can provide any client that implements this surface.
 */
export interface BridgeClient {
  rpc(fn: string, args: Record<string, unknown>): any;
}

type BridgeClientFactory = () => BridgeClient;

let bridgeClientFactory: BridgeClientFactory | null = null;

/**
 * Registers the client factory used by bridge internals.
 *
 * Call this once during app bootstrap (before schema building) to connect
 * the bridge package to your runtime DB client implementation.
 */
export function configureBridgeClient(factory: BridgeClientFactory): void {
  bridgeClientFactory = factory;
}

/**
 * Returns the configured bridge client instance.
 *
 * @throws Error when no client factory has been configured yet.
 */
export function getBridgeClient(): BridgeClient {
  if (!bridgeClientFactory) {
    throw new Error(
      "@monocircuit/bridge client is not configured. Call configureBridgeClient(...) before building schemas.",
    );
  }

  return bridgeClientFactory();
}
