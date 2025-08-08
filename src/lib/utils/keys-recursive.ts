export type KeysRecursive<
  T extends Record<string, any>,
  LeafType = never,
  Key extends keyof T = keyof T
> = (
  Key extends string
    ? T[Key] extends LeafType
      ? Key
      : T[Key] extends Record<string, any>
        ? `${ Key }.${ KeysRecursive<T[Key], LeafType, keyof T[Key]> }`
        : Key
    : never
  );
