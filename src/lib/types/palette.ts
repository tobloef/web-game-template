import type { Branded } from "../utils/brand";
import { CustomError } from "../utils/custom-error";
import { packColor, type Color } from "./color";

// Each uint32 represents a color in the format 0xRRGGBBAA.
export type Palette = Branded<Uint32Array, "Palette">;

export async function extractPalette(
  file: Blob,
): Promise<Palette | PaletteError> {
  const bitmap = await createImageBitmap(file, {
    colorSpaceConversion: "none",
  });

  const imageData = getImageData(bitmap);

  bitmap.close();

  if (imageData instanceof PaletteError) {
    return imageData;
  }

  const uniqueColors = getUniqueColors(imageData);

  return uniqueColors;
}

function getImageData(bitmap: ImageBitmap): Uint8ClampedArray | PaletteError {
  const offscreenCanvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = offscreenCanvas.getContext("2d");

  if (context === null) {
    return new PaletteError(
      "Could not create 2D Canvas context to extract palette.",
    );
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(bitmap, 0, 0);

  const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);

  return imageData.data;
}

function getUniqueColors(imageData: Uint8ClampedArray): Palette {
  const packedColors = new Set<Color>();

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i]!;
    const g = imageData[i + 1]!;
    const b = imageData[i + 2]!;
    const a = imageData[i + 3]!;

    const packedColor = packColor(r, g, b, a);

    packedColors.add(packedColor);
  }

  const colors = new Uint32Array(packedColors.size);

  const packedColorsArray = Array.from(packedColors);

  for (let i = 0; i < packedColorsArray.length; i++) {
    colors[i] = packedColorsArray[i]!;
  }

  return colors as Palette;
}

export class PaletteError extends CustomError {}
