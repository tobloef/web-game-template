import { CustomError } from './custom-error.js';


export async function loadTextFile(
  url: string,
): Promise<string | FileLoadingError> {
  const response = await fetchFile(url);

  if (response instanceof FileLoadingError) {
    return response;
  }

  return await response.text();
}

export async function loadBinaryFile(
  url: string,
): Promise<Blob | FileLoadingError> {
  const response = await fetchFile(url);

  if (response instanceof FileLoadingError) {
    return response;
  }

  return await response.blob();
}

async function fetchFile(
  url: string,
): Promise<Response | FileLoadingError> {
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    return new FileLoadingError(url, { cause: error });
  }

  if (!response.ok) {
    const reason = `${ response.status } ${ response.statusText }`;
    return new FileLoadingError(url, { reason });
  }

  return response;
}

export class FileLoadingError extends CustomError {
  constructor(
    url: string,
    extra?: {
      reason?: string;
      cause?: Error;
    },
  ) {
    let message = `Failed to load file "${ url }"`;

    if (extra?.reason) {
      message += `: ${ extra.reason }`;
    }

    super(message, { cause: extra?.cause });
  }
}
