import type { Float32, Uint32 } from "./data";

export type Vector3<Type extends number = number> = {
  x: Type;
  y: Type;
  z: Type;
};

export type ReadonlyVector3<Type extends number = number> = Readonly<{
  x: Type;
  y: Type;
  z: Type;
}>;

export type Vector3Float32 = Vector3<Float32>;
export type Vector3Uint32 = Vector3<Uint32>;

export type ReadonlyVector3Float32 = ReadonlyVector3<Float32>;
export type ReadonlyVector3Uint32 = ReadonlyVector3<Uint32>;
