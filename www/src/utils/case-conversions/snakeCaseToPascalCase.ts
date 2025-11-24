export type Pascalize<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Head>}${Pascalize<Tail>}`
    : Capitalize<S>;

export function snakeCaseToPascalCase(str: string): string {
  return str
    .split("_")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
