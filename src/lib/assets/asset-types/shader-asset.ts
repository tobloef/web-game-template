import { Asset } from "../asset.js";
import { FileLoadingError, loadTextFile } from "../../utils/load-file.js";
import {
  ComputeShader,
  type ComputeShaderDescriptor,
  RenderShader,
  type RenderShaderDescriptor,
  ShaderParsingError,
} from "../../types/shader.js";

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
      throw ShaderParsingError;
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
      throw ShaderParsingError;
    }

    return descriptor;
  }
}
