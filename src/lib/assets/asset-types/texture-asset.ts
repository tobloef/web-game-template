import { Asset } from "../asset.js";
import type { Texture } from "../../types/texture.js";
import { FileLoadingError, loadBinaryFile } from "../../utils/load-file.js";

export class TextureAsset extends Asset<Texture> {
  bitmap?: ImageBitmap;

  async load(): Promise<Texture> {
    const file = await loadBinaryFile(this.url);

    if (file instanceof FileLoadingError) {
      throw file;
    }

    const bitmap = await createImageBitmap(file, {
      colorSpaceConversion: "none",
    });

    this.bitmap = bitmap;

    return bitmap as Texture;
  }

  async destroy() {
    if (!this.bitmap) {
      return;
    }

    this.bitmap.close();
    this.bitmap = undefined;
  }
}
