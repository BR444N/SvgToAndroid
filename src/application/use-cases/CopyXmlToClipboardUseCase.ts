import type { IClipboardService } from '../../domain/ports/IClipboardService';

export class CopyXmlToClipboardUseCase {
  constructor(private readonly clipboardService: IClipboardService) {}

  public async execute(xmlContent: string): Promise<boolean> {
    if (!xmlContent) return false;
    return await this.clipboardService.copyText(xmlContent);
  }
}
