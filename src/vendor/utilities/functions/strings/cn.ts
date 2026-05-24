/**
 * Concatenates class names, filtering out falsy values.
 *
 * Accepts strings and common falsy values (`undefined`, `null`, `false`) and
 * returns a single space-separated string containing only the truthy class
 * names. This is useful for building `className` values conditionally in
 * React or plain HTML.
 *
 * Example:
 * ```ts
 * cn('btn', isActive && 'btn--active', undefined, false);
 * // => 'btn btn--active'
 * ```
 *
 * @param {...(string|undefined|false|null)[]} classes - Values to join.
 * @returns {string} Space-separated class names.
 */
function cn(...classes: Array<string | undefined | false | null>): string {
  return classes.filter(Boolean).join(" ");
}

export default cn;
