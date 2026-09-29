import type { IDownloadService } from '../../domain/ports/IClipboardService';

export class BrowserDownloadService implements IDownloadService {
  public downloadFile(content: string | Blob, fileName: string, mimeType = 'application/xml;charset=utf-8'): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
