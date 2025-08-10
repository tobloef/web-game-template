import type { KeysRecursive } from './keys-recursive.js';


export function pickRecursive<
  T extends Record<string, any>,
  Key extends KeysRecursive<T, LeafType>,
  LeafType = never
>(
  obj: T,
  key: Key,
): PickRecursive<T, Key, LeafType> {
  const keys = key.split('.');

  let result = obj;

  for (const k of keys) {
    result = result[k];
  }

  return result as PickRecursive<T, Key, LeafType>;
}

export type PickRecursive<
  T extends Record<string, any>,
  Keys extends KeysRecursive<T, LeafType>,
  LeafType = never
> = (
  Keys extends `${ infer Key }.${ infer Rest }`
    ? Rest extends KeysRecursive<T[Key], LeafType, keyof T[Key]>
      ? PickRecursive<T[Key], Rest, LeafType>
      : never
    : T[Keys]
  );
