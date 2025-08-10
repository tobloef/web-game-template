import type { Branded } from "../utils/brand";
import { BYTES_PER_UINT32 } from "./data";

// RGBA color packed into a single number. Defined like `0xRRGGBBAA`.
export type Color = Branded<number, "Color">;

// Each component to pack is an integer in the range [0, 255].
export function packColor(r: number, g: number, b: number, a: number): Color {
  const packedColor = (r << 24) | (g << 16) | (b << 8) | a;

  return packedColor as Color;
}

// Each unpacked component is an integer in the range [0, 255].
export function unpackColor(color: Color): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const r = (color >> 24) & 0xff;
  const g = (color >> 16) & 0xff;
  const b = (color >> 8) & 0xff;
  const a = color & 0xff;

  return { r, g, b, a };
}

export const BYTES_PER_COLOR = BYTES_PER_UINT32;

export const WHITE = 0xffffffff as Color;
export const BLACK = 0x000000ff as Color;
export const TRANSPARENT = 0x00000000 as Color;
