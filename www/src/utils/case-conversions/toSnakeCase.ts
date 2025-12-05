import type { Snakeize } from "./types";

/**
 * Convert a string to snake_case at runtime.
 *
 * - recognizes camelCase / PascalCase boundaries (aB → a_b)
 * - normalizes `-`, space, `.`, `/`, `\` and multiple separators to `_`
 * - lowercases all letters
 * - implemented with a single loop (no RegExp, split, map, filter)
 */
export function toSnakeCase<S extends string>(str: S): Snakeize<S> {
  let result = "";
  const length = str.length;
  let hasBeenSeperator = false;

  for (let i = 0; i < length; i++) {
    const ch = str[i]!;
    const code = ch.charCodeAt(0);

    // separators -> optionally add single '_'
    if (
      ch === "_" ||
      ch === "-" ||
      ch === " " ||
      ch === "." ||
      ch === "/" ||
      ch === "\\"
    ) {
      if (!hasBeenSeperator && result.length > 0) {
        result += "_";
        hasBeenSeperator = true;
      }
      continue;
    }

    const isUpper = code >= 65 && code <= 90; // A-Z

    // camel boundary: aB -> insert '_' before uppercase that follows lower/digit
    if (isUpper && i > 0) {
      const prev = str[i - 1]!;
      const prevCode = prev.charCodeAt(0);
      const isLower = prevCode >= 97 && prevCode <= 122; // a-z
      const isDigit = prevCode >= 48 && prevCode <= 57; // 0-9

      if (isLower || isDigit) {
        result += "_";
      }
    }

    result += ch.toLowerCase();
    hasBeenSeperator = false;
  }

  return result as Snakeize<S>;
}
