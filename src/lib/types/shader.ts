import { CustomError } from "../utils/custom-error";

export class Shader {
  name?: string;
  code: string;

  constructor(params: { name?: string; code: string }) {
    this.name = params.name;
    this.code = params.code;
  }
}

export type RenderShaderDescriptor = {
  label?: string;
  code: string;
  vertexEntryPoint: string;
  fragmentEntryPoint: string;
};

export class RenderShader extends Shader {
  getDescriptor(): RenderShaderDescriptor | ShaderParsingError {
    const vertexEntryPoint = getVertexEntryPoint(this.code);
    const fragmentEntryPoint = getFragmentEntryPoint(this.code);

    if (vertexEntryPoint === undefined) {
      return new ShaderParsingError(this.name, {
        reason: "No vertex entry point found in shader file",
      });
    }

    if (fragmentEntryPoint === undefined) {
      return new ShaderParsingError(this.name, {
        reason: "No fragment entry point found in shader file",
      });
    }

    const fullDescriptor: RenderShaderDescriptor = {
      label: this.name,
      vertexEntryPoint,
      fragmentEntryPoint,
      code: this.code,
    };

    return fullDescriptor;
  }
}

export type ComputeShaderDescriptor = {
  label?: string;
  code: string;
  entryPoint: string;
};

export class ComputeShader extends Shader {
  getDescriptor(): ComputeShaderDescriptor | ShaderParsingError {
    const entryPoint = getComputeEntryPoint(this.code);

    if (entryPoint === undefined) {
      return new ShaderParsingError(this.name, {
        reason: "No compute entry point found in shader file",
      });
    }

    const fullDescriptor: ComputeShaderDescriptor = {
      label: this.name,
      entryPoint,
      code: this.code,
    };

    return fullDescriptor;
  }
}

export function getVertexEntryPoint(code: string): string | undefined {
  const match = code.match(/@vertex\s+fn\s+(.+?)\s*\(/);
  return match?.[1];
}

export function getFragmentEntryPoint(code: string): string | undefined {
  const match = code.match(/@fragment\s+fn\s+(.+?)\s*\(/);
  return match?.[1];
}

export function getComputeEntryPoint(code: string): string | undefined {
  const match = code.match(/@compute\s+(?:@[a-z_].+?\s+)*fn\s+(.+?)\s*\(/);
  return match?.[1];
}

export function getShaderType(
  name: string,
  code: string,
): "render" | "compute" | ShaderParsingError {
  if (getVertexEntryPoint(code) !== undefined) {
    return "render";
  } else if (getFragmentEntryPoint(code) !== undefined) {
    return "render";
  } else if (getComputeEntryPoint(code) !== undefined) {
    return "compute";
  }

  return new ShaderParsingError(name, {
    reason: "No entry point found in shader file",
  });
}

export class ShaderParsingError extends CustomError {
  constructor(
    name?: string,
    extra?: {
      reason?: string;
      cause?: Error;
    },
  ) {
    let message = `Failed to parse shader`;

    if (name) {
      message += ` "${name}"`;
    }

    if (extra?.reason) {
      message += `: ${extra.reason}`;
    }

    message += ".";

    super(message, { cause: extra?.cause });
  }
}
