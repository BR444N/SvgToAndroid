export interface IClipboardService {
  /**
   * Copia texto al portapapeles del sistema operativo.
   */
  copyText(text: string): Promise<boolean>;
}

export interface IDownloadService {
  /**
   * Descarga un archivo de texto plano o blob en el navegador del usuario.
   */
  downloadFile(content: string | Blob, fileName: string, mimeType?: string): void;
}
