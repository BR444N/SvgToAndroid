export interface VectorDrawableOptions {
  widthDp: number;
  heightDp: number;
  viewportWidth: number;
  viewportHeight: number;
  tintColor?: string;
  autoMirrored?: boolean;
}

export class VectorDrawable {
  constructor(
    public readonly fileId: string,
    public readonly fileName: string,
    public readonly xmlContent: string,
    public readonly options: VectorDrawableOptions,
    public readonly generatedAt: Date = new Date()
  ) {}

  public get xmlByteSize(): number {
    return new TextEncoder().encode(this.xmlContent).length;
  }
}
