import { Asset } from "../asset";
import { FileLoadingError, loadBinaryFile } from "../../utils/load-file";
import {
  createSpriteMap,
  type SpriteMap,
  type SpriteMapDescriptor,
  SpriteMapValidationError,
} from "../../types/sprite-map";

export class SpriteMapAsset extends Asset<SpriteMap> {
  descriptor;
  bitmap?: ImageBitmap;

  constructor(params: {
    url: string;
    name?: string;
    descriptor: SpriteMapDescriptor;
  }) {
    super(params);
    this.descriptor = params.descriptor;
  }

  async load(): Promise<SpriteMap> {
    const file = await loadBinaryFile(this.url);

    if (file instanceof FileLoadingError) {
      throw file;
    }

    const bitmap = await createImageBitmap(file, {
      colorSpaceConversion: "none",
    });

    this.bitmap = bitmap;

    const spriteMap = createSpriteMap(this.descriptor, bitmap);

    if (spriteMap instanceof SpriteMapValidationError) {
      throw spriteMap;
    }

    return spriteMap;
  }

  async destroy() {
    if (!this.bitmap) {
      return;
    }

    this.bitmap.close();
    this.bitmap = undefined;
  }
}
