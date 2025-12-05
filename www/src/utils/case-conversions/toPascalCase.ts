import type { Pascalize } from "./types";

/**
 * Convert a string to PascalCase at runtime.
 *
 * - treats separators (`_ - space . / \`) as word boundaries
 * - recognizes existing camelCase/PascalCase boundaries
 * - capitalizes the first letter of each detected word
 * - implemented with a single loop (no RegExp)
 */
export function toPascalCase<S extends string>(str: S): Pascalize<S> {
  let result = "";
  const length = str.length;
  let shouldCapitalizeNext = true; // first word always capitalized

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
      shouldCapitalizeNext = true;
      continue;
    }

    const isUpper = code >= 65 && code <= 90; // A-Z

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

  return result as Pascalize<S>;
}
