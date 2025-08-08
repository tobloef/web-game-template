export abstract class Asset<T> {
  url: string;
  name?: string;

  constructor(params: { url: string; name?: string }) {
    this.url = params.url;
    this.name = params.name;
  }

  abstract load(): Promise<T>;

  async destroy(): Promise<void> {}
}
