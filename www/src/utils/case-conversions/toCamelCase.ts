import type { Camelize } from "./types";

/**
 * Convert a string to camelCase at runtime.
 *
 * - same rules as `toPascalCase` but first word starts lowercase
 * - respects camelCase boundaries
 * - implemented with a single loop (no RegExp)
 */
export function toCamelCase<S extends string>(str: S): Camelize<S> {
  let result = "";
  const length = str.length;
  let didSeeAny = false; // whether we've seen a non-separator char
  let shouldCapitalizeNext = false; // for words after the first

  for (let i = 0; i < length; i++) {
    const ch = str[i]!;
    const code = ch.charCodeAt(0);

    if (
      ch === "_" ||
      ch === "-" ||
      ch === " " ||
      ch === "." ||
      ch === "/" ||
      ch === "\\"
    ) {
      if (didSeeAny) {
        shouldCapitalizeNext = true;
      }
      continue;
    }

    const isUpper = code >= 65 && code <= 90; // A-Z

    // first non-separator -> always lowercase
    if (!didSeeAny) {
      result += ch.toLowerCase();
      didSeeAny = true;
      shouldCapitalizeNext = false;
      continue;
    }

    // Camel boundary: aB -> keep B uppercase if it's a true boundary
    if (!shouldCapitalizeNext && isUpper && i > 0) {
      const prev = str[i - 1]!;
      const prevCode = prev.charCodeAt(0);
      const isLower = prevCode >= 97 && prevCode <= 122; // a-z
      const isDigit = prevCode >= 48 && prevCode <= 57; // 0-9

      if (isLower || isDigit) {
        result += ch; // already uppercase, keep it
        continue;
      }
    }

    if (shouldCapitalizeNext) {
      result += ch.toUpperCase();
      shouldCapitalizeNext = false;
    } else {
      result += ch.toLowerCase();
    }
  }

  return result as Camelize<S>;
}
