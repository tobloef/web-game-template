import { Asset } from "../asset";
import type { Texture } from "../../types/texture";
import { FileLoadingError, loadBinaryFile } from "../../utils/load-file";

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
