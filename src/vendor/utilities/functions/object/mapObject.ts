function mapObject<T extends Record<string, any>, R>(
  obj: T,
  mapper: <K extends keyof T>(key: K, value: T[K]) => [string, R],
): Record<string, R> {
  return Object.fromEntries(
    (Object.keys(obj) as (keyof T)[]).map(key => mapper(key, obj[key])),
  ) as Record<string, R>;
}

export default mapObject;
