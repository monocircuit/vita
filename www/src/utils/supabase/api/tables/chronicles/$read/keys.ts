/**
 * @author ChatGPT5
 *
 * Shared cache key under which the **normalized base store** is stored.
 * All views (all/own/byUser/byType/byName) eventually read from this cache.
 */
export const chroniclesBaseKey = ["chronicles"] as const;

/**
 * @author ChatGPT5
 *
 * Internal “network keys”, used only to track each network fetch.
 * Results are **always** merged into the base store (`chronBaseKey`).
 */
export const netKey = {
  all: () => ["chronicles", "net", "all"] as const,
  byUser: (userId: string) => ["chronicles", "net", "byUser", userId] as const,
  byType: (type: string) =>
    ["chronicles", "net", "byType", String(type)] as const,
  byName: (name: string) => ["chronicles", "net", "byName", name] as const,
  own: () => ["chronicles", "net", "own"] as const,
  byId: (id: string) => ["chronicles", "net", "byId", id] as const, // 🔹 NEU
};
