import JSZip from 'jszip';
import type { IZipExporter } from '../../domain/ports/IZipExporter';
import type { VectorDrawable } from '../../domain/entities/VectorDrawable';
import { BrowserDownloadService } from './BrowserDownloadService';

export class BrowserZipExporter implements IZipExporter {
  private downloadService = new BrowserDownloadService();

  public async exportZip(drawables: VectorDrawable[], zipFileName = 'android_vectors.zip'): Promise<void> {
    if (drawables.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('drawable') ?? zip;

    // Evitar colisiones de nombres si hay archivos repetidos
    const usedNames = new Set<string>();

    for (const item of drawables) {
      let finalName = item.fileName;
      let counter = 1;

      while (usedNames.has(finalName)) {
        const base = item.fileName.replace(/\.xml$/, '');
        finalName = `${base}_${counter}.xml`;
        counter++;
      }

      usedNames.add(finalName);
      folder.file(finalName, item.xmlContent);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    this.downloadService.downloadFile(blob, zipFileName, 'application/zip');
  }
}
