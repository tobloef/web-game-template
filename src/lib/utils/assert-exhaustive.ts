/**
 * Put this in the default case of a `switch` or `else` statement to ensure all
 * cases are handled. Intended purely as a compile-time check, the runtime code
 * should never be reached.
 */
export function assertExhaustive(value: never): void {
  throw new Error(`Unexpected value: ${value}`);
}
