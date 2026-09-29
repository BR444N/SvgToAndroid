import type { IDownloadService } from '../../domain/ports/IClipboardService';
import type { VectorDrawable } from '../../domain/entities/VectorDrawable';

export class DownloadSingleXmlUseCase {
  constructor(private readonly downloadService: IDownloadService) {}

  public execute(drawable: VectorDrawable): void {
    this.downloadService.downloadFile(drawable.xmlContent, drawable.fileName, 'application/xml');
  }
}
