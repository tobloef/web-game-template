import { CustomError } from "../utils/custom-error.js";
import type { Vector2 } from "./vector2.js";

export type SpriteMapDescriptor = {
  spriteSize: Vector2;
  gap?: number;
  border?: number;
};

export type SpriteMap = {
  spriteSize: Vector2;
  gap: number;
  border: number;
  spriteCount: Vector2;
  bitmap: ImageBitmap;
};

export function createSpriteMap(
  descriptor: SpriteMapDescriptor,
  bitmap: ImageBitmap,
): SpriteMap | SpriteMapValidationError {
  const { spriteSize, gap = 0, border = 0 } = descriptor;

  if (spriteSize.x <= 0) {
    return new SpriteMapValidationError("Sprite width must be greater than 0.");
  }

  if (spriteSize.y <= 0) {
    return new SpriteMapValidationError(
      "Sprite height must be greater than 0.",
    );
  }

  if (gap < 0) {
    return new SpriteMapValidationError(
      "Gap must be greater than or equal to 0.",
    );
  }

  if (border < 0) {
    return new SpriteMapValidationError(
      "Border must be greater than or equal to 0.",
    );
  }

  const imageWidth = bitmap.width;
  const imageHeight = bitmap.height;

  const spritesPerRow = (imageWidth - border * 2 + gap) / (spriteSize.x + gap);
  const spritesPerColumn =
    (imageHeight - border * 2 + gap) / (spriteSize.y + gap);

  if (spritesPerRow % 1 !== 0) {
    return new SpriteMapValidationError(
      `Sprite map has a non-integer number of sprites per row (${spritesPerRow})`,
    );
  }

  if (spritesPerColumn % 1 !== 0) {
    return new SpriteMapValidationError(
      `Sprite map has a non-integer number of sprites per column (${spritesPerColumn})`,
    );
  }

  return {
    spriteSize,
    gap,
    border,
    spriteCount: {
      x: spritesPerRow,
      y: spritesPerColumn,
    },
    bitmap,
  };
}

export class SpriteMapValidationError extends CustomError {}
