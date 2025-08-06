import type { Float32, Uint32 } from "./units/data";

export type Vector2<Type extends number = number> = {
  x: Type;
  y: Type;
};

export type ReadonlyVector2<Type extends number = number> = Readonly<{
  x: Type;
  y: Type;
}>;

export type Vector2Float32 = Vector2<Float32>;
export type Vector2Uint32 = Vector2<Uint32>;

export type ReadonlyVector2Float32 = ReadonlyVector2<Float32>;
export type ReadonlyVector2Uint32 = ReadonlyVector2<Uint32>;
