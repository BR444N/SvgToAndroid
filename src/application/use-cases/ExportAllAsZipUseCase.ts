import type { IZipExporter } from '../../domain/ports/IZipExporter';
import type { VectorDrawable } from '../../domain/entities/VectorDrawable';

export class ExportAllAsZipUseCase {
  constructor(private readonly zipExporter: IZipExporter) {}

  public async execute(drawables: VectorDrawable[], customZipName?: string): Promise<void> {
    if (drawables.length === 0) {
      throw new Error('No hay archivos vectoriales disponibles para exportar.');
    }
    await this.zipExporter.exportZip(drawables, customZipName);
  }
}
