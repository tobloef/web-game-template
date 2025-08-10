import type { Branded } from "../utils/brand";

export type Bits = Branded<number, "Bits">;
export type Bytes = Branded<number, "Bytes">;
export type Elements = Branded<number, "Bytes">;
export type Float32s = Branded<number, "Float32">;
export type Uint32s = Branded<number, "Uint32">;

export type Float32 = Branded<number, "Float32">;
export type Uint32 = Branded<number, "Uint32">;

export const BYTES_PER_FLOAT32 = 4 as Bytes;
export const BYTES_PER_UINT32 = 4 as Bytes;
export const BYTES_PER_VECTOR2_UINT32 = (BYTES_PER_UINT32 * 2) as Bytes;
export const BYTES_PER_VECTOR3_UINT32 = (BYTES_PER_UINT32 * 3) as Bytes;
export const BYTES_PER_VECTOR2_FLOAT32 = (BYTES_PER_FLOAT32 * 2) as Bytes;
export const BYTES_PER_VECTOR3_FLOAT32 = (BYTES_PER_FLOAT32 * 3) as Bytes;
