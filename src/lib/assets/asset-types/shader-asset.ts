import { Asset } from "../asset";
import { FileLoadingError, loadTextFile } from "../../utils/load-file";
import {
  ComputeShader,
  type ComputeShaderDescriptor,
  RenderShader,
  type RenderShaderDescriptor,
  ShaderParsingError,
} from "../../types/shader";

export class RenderShaderAsset extends Asset<RenderShaderDescriptor> {
  async load(): Promise<RenderShaderDescriptor> {
    const code = await loadTextFile(this.url);

    if (code instanceof FileLoadingError) {
      throw code;
    }

    const shader = new RenderShader({
      code,
      name: this.name,
    });

    const descriptor = shader.getDescriptor();

    if (descriptor instanceof ShaderParsingError) {
      throw descriptor;
    }

    return descriptor;
  }
}

export class ComputeShaderAsset extends Asset<ComputeShaderDescriptor> {
  async load(): Promise<ComputeShaderDescriptor> {
    const code = await loadTextFile(this.url);

    if (code instanceof FileLoadingError) {
      throw code;
    }

    const shader = new ComputeShader({
      code,
      name: this.name,
    });

    const descriptor = shader.getDescriptor();

    if (descriptor instanceof ShaderParsingError) {
      throw descriptor;
    }

    return descriptor;
  }
}
