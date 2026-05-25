/**
 * Dev-only global logger with curried API.
 *
 * DEV: available as `logging` and attached to `window.__logger`.
 * PROD: `logging` is `undefined` (tree-shakeable, zero side effects).
 */

export interface TagChain {
  (tag: string): TagChain;
  (data: unknown): void;
}

export interface LogExportControls {
  downloadAsText(fileName?: string): void;
  downloadAsJSON(fileName?: string): void;
  clear(): void;
  listPaths(): string[];
  toJSON(): unknown;
  toText(): string;
}

export interface LoggerChain extends LogExportControls {
  (segment: string): LoggerChain;
  reset(): LoggerChain;
  path(): string[];
  disable(): void;
  enable(): void;
  isEnabled(): boolean;
}

export interface LoggerGlobal extends LogExportControls {
  /** Starts a new selection chain at the given segment. */
  (segment: string): LoggerChain;
  /** Root selection is always empty; kept for convenience. */
  reset(): LoggerGlobal;
  /** Always returns [] for the root logger. */
  path(): string[];
  disable(): void;
  enable(): void;
  isEnabled(): boolean;
}

export type CurriedLog = (seed: string) => TagChain;

export interface Logging {
  readonly name: string;
  log: CurriedLog;
  activate(...segments: string[]): void;
  deactivate(...segments: string[]): void;
  enable(): void;
  disable(): void;
  isEnabled(): boolean;
  setName(name: string): void;
}

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

declare global {
  interface Window {
    /** Dev-only: callable logger export helper for DevTools. */
    __logger?: LoggerGlobal;
    /** Dev-only: fully disable logger output at runtime. */
    __disableLogger?: () => void;
  }

  /** Dev-only: allow using `__logger("...")` directly in TS/DevTools. */
  // eslint-disable-next-line no-var
  var __logger: LoggerGlobal | undefined;
  /** Dev-only: allow using `__disableLogger()` directly in TS/DevTools. */
  // eslint-disable-next-line no-var
  var __disableLogger: (() => void) | undefined;
}

const isDev = (import.meta.env?.DEV ?? process.env.NODE_ENV !== "production") === true;

function createDevLogging(loggerName: string): Logging {
  let isEnabled = false;
  let name = loggerName;

  const disabledPrefixes = new Set<string>();
  const SEP = "";

  interface LogEntry {
    timestamp: string;
    path: string[];
    data: unknown;
  }

  const logsByPath = new Map<string, LogEntry[]>();

  const toKey = (parts: string[]) => parts.join(SEP);

  const safeStringify = (value: unknown, space = 2) => {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_key, next) => {
        if (typeof next === "object" && next !== null) {
          if (seen.has(next)) return "[Circular]";
          seen.add(next);
        }
        if (typeof next === "bigint") return next.toString();
        return next;
      },
      space,
    );
  };

  const pathToDisplay = (parts: string[]) => parts.map(p => `[${p}]`).join(" ");

  const matchesPrefixKey = (key: string, prefixKey: string) => {
    if (prefixKey === "") return true;
    return key === prefixKey || key.startsWith(`${prefixKey}${SEP}`);
  };

  const buildExportControls = (prefixParts: string[]): LogExportControls => {
    const prefixKey = toKey(prefixParts);

    const collect = () => {
      const result: Record<string, LogEntry[]> = {};
      for (const [key, entries] of logsByPath.entries()) {
        if (!matchesPrefixKey(key, prefixKey)) continue;
        const display = pathToDisplay(key ? key.split(SEP) : []);
        result[display || "[all]"] = (result[display || "[all]"] ?? []).concat(entries);
      }
      return result;
    };

    const listPaths = () => {
      const out: string[] = [];
      for (const key of logsByPath.keys()) {
        if (!matchesPrefixKey(key, prefixKey)) continue;
        out.push(pathToDisplay(key ? key.split(SEP) : []));
      }
      return out.sort();
    };

    const toText = () => {
      const grouped = collect();
      const lines: string[] = [];

      for (const path of Object.keys(grouped).sort()) {
        for (const entry of grouped[path] ?? []) {
          const header = `[${entry.timestamp}] ${path}`;
          let serialized = "";
          try {
            serialized = safeStringify(entry.data, 2);
          } catch {
            serialized = String(entry.data);
          }

          lines.push(header);
          lines.push(serialized);
          lines.push("");
        }
      }

      return lines.join("\n");
    };

    const download = (content: string, mime: string, fileName: string) => {
      if (typeof window === "undefined" || typeof document === "undefined") return;
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    };

    const baseFileName = () => {
      const safePrefix = prefixParts.length ? prefixParts.join("_") : "all";
      return `${name}-${safePrefix}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    };

    return {
      listPaths,
      clear() {
        for (const key of Array.from(logsByPath.keys())) {
          if (!matchesPrefixKey(key, prefixKey)) continue;
          logsByPath.delete(key);
        }
      },
      toJSON() {
        return collect();
      },
      toText,
      downloadAsText(fileName) {
        download(toText(), "text/plain;charset=utf-8", fileName ?? `${baseFileName()}.txt`);
      },
      downloadAsJSON(fileName) {
        const json = safeStringify(collect(), 2);
        download(json, "application/json;charset=utf-8", fileName ?? `${baseFileName()}.json`);
      },
    };
  };

  const __getExportControls = (prefixParts: string[]) => buildExportControls(prefixParts);

  const isPathDisabled = (parts: string[]) => {
    if (disabledPrefixes.has("")) return true;
    for (let i = 1; i <= parts.length; i += 1) {
      if (disabledPrefixes.has(toKey(parts.slice(0, i)))) return true;
    }
    return false;
  };

  const activate = (...segments: string[]) => {
    if (segments.length === 0) {
      disabledPrefixes.clear();
      return;
    }

    // If everything is globally disabled, enabling a subtree should at least remove the global flag.
    disabledPrefixes.delete("");

    const key = toKey(segments);
    for (const existing of Array.from(disabledPrefixes)) {
      if (existing === "") continue;
      if (existing === key || existing.startsWith(`${key}${SEP}`)) {
        disabledPrefixes.delete(existing);
      }
    }
  };

  const deactivate = (...segments: string[]) => {
    if (segments.length === 0) {
      disabledPrefixes.add("");
      return;
    }

    const key = toKey(segments);
    disabledPrefixes.add(key);
    for (const existing of Array.from(disabledPrefixes)) {
      if (existing === "" || existing === key) continue;
      if (existing.startsWith(`${key}${SEP}`)) {
        disabledPrefixes.delete(existing);
      }
    }
  };

  const log: CurriedLog = seed => {
    const tags: string[] = [];
    let hasLogged = false;

    const chain = ((arg: unknown) => {
      if (typeof arg === "string") {
        if (!isEnabled || hasLogged) return chain;
        tags.push(arg);
        return chain;
      }

      if (!isEnabled || hasLogged) return;

      hasLogged = true;

      if (isPathDisabled([seed, ...tags])) return;

      const timestamp = new Date().toISOString();
      const header = [name, timestamp, seed, ...tags].map(part => `[${part}]`).join(" ");

      const pathKey = toKey([seed, ...tags]);
      const nextEntry: LogEntry = {
        timestamp,
        path: [seed, ...tags],
        data: arg,
      };
      const bucket = logsByPath.get(pathKey);
      if (bucket) bucket.push(nextEntry);
      else logsByPath.set(pathKey, [nextEntry]);

      // IMPORTANT: keep this exact structure (header line + expandable object)
      // eslint-disable-next-line no-console
      console.log(header, arg);
    }) as TagChain;

    return chain;
  };

  return {
    get name() {
      return name;
    },
    log,
    activate,
    deactivate,
    enable() {
      isEnabled = true;
    },
    disable() {
      isEnabled = false;
    },
    isEnabled() {
      return isEnabled;
    },
    setName(nextName: string) {
      name = nextName;
    },
    // Internal hook for window.__logger (DEV only)
    __getExportControls,
  } as any as Logging;
}

/**
 * Single export.
 *
 * DEV: real logger + `window.__logger = …`
 * PROD: `undefined` (tree-shakeable)
 */
export const logging: Logging | undefined = isDev
  ? (() => {
      const instance = createDevLogging("@monocircuit/logger");

      if (typeof window !== "undefined") {
        const getControls = (parts: string[]) =>
          (instance as any).__getExportControls ? (instance as any).__getExportControls(parts) : undefined;

        const makeChain = (initialParts: string[]): LoggerChain => {
          const parts = [...initialParts];

          const chain = function (segment: string) {
            parts.push(segment);
            return chain;
          } as unknown as LoggerChain;

          const controlsForCurrentPath = () => getControls(parts);

          chain.reset = () => {
            parts.length = 0;
            return chain;
          };

          chain.path = () => [...parts];

          chain.disable = () => {
            instance.disable();
          };

          chain.enable = () => {
            instance.enable();
          };

          chain.isEnabled = () => instance.isEnabled();

          chain.downloadAsText = fileName => {
            controlsForCurrentPath()?.downloadAsText(fileName);
          };

          chain.downloadAsJSON = fileName => {
            controlsForCurrentPath()?.downloadAsJSON(fileName);
          };

          chain.clear = () => {
            controlsForCurrentPath()?.clear();
          };

          chain.listPaths = () => controlsForCurrentPath()?.listPaths() ?? [];
          chain.toJSON = () => controlsForCurrentPath()?.toJSON();
          chain.toText = () => controlsForCurrentPath()?.toText() ?? "";

          return chain;
        };

        // window.__logger.downloadAsJSON() -> all
        // window.__logger("DROP").downloadAsText() -> subtree
        const __loggerGlobal = function (segment: string) {
          return makeChain([segment]);
        } as unknown as LoggerGlobal;

        const rootControls = () => getControls([]);

        __loggerGlobal.reset = () => __loggerGlobal;
        __loggerGlobal.path = () => [];
        __loggerGlobal.disable = () => instance.disable();
        __loggerGlobal.enable = () => instance.enable();
        __loggerGlobal.isEnabled = () => instance.isEnabled();
        __loggerGlobal.downloadAsText = fileName => rootControls()?.downloadAsText(fileName);
        __loggerGlobal.downloadAsJSON = fileName => rootControls()?.downloadAsJSON(fileName);
        __loggerGlobal.clear = () => rootControls()?.clear();
        __loggerGlobal.listPaths = () => rootControls()?.listPaths() ?? [];
        __loggerGlobal.toJSON = () => rootControls()?.toJSON();
        __loggerGlobal.toText = () => rootControls()?.toText() ?? "";

        window.__logger = __loggerGlobal;
        globalThis.__logger = __loggerGlobal;

        const disableLogger = () => {
          instance.disable();
        };

        window.__disableLogger = disableLogger;
        globalThis.__disableLogger = disableLogger;
      }

      return instance;
    })()
  : undefined;
