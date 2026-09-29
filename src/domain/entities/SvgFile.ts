export interface SvgFileMetadata {
  id: string;
  originalName: string;
  sanitizedAndroidName: string;
  sizeBytes: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
  createdAt: Date;
}

export class SvgFile {
  constructor(
    public readonly id: string,
    public readonly originalName: string,
    public readonly rawContent: string,
    public readonly sanitizedContent: string,
    public readonly metadata: SvgFileMetadata
  ) {}

  /**
   * Genera un nombre de recurso válido para Android (snake_case, minúsculas, sin caracteres especiales)
   * ej: "My Icon #1.svg" -> "ic_my_icon_1.xml"
   */
  public static toValidAndroidFileName(fileName: string): string {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const sanitized = baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');

    const prefix = sanitized.startsWith('ic_') ? '' : 'ic_';
    const finalName = `${prefix}${sanitized || 'vector'}`;
    return `${finalName}.xml`;
  }
}
