import { Asset } from "../asset";

import { FileLoadingError, loadBinaryFile } from "../../utils/load-file";
import {
  extractPalette,
  type Palette,
  PaletteError,
} from "../../types/palette";

export class PaletteAsset extends Asset<Palette> {
  async load(): Promise<Palette> {
    const file = await loadBinaryFile(this.url);

    if (file instanceof FileLoadingError) {
      throw file;
    }

    const palette = await extractPalette(file);

    if (palette instanceof PaletteError) {
      throw palette;
    }

    return palette;
  }
}
