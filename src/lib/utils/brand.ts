declare const __brand: unique symbol;

export type Brand<Name extends string> = { [__brand]: Name };

export type Branded<T, Name extends string> = T & Brand<Name>;

export type Nominal<T, Name extends string> = T | Brand<Name>;
