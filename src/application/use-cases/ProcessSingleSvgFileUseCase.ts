import type { ISvgValidator } from '../../domain/ports/ISvgValidator';
import type { ISvgConverter } from '../../domain/ports/ISvgConverter';
import type { ProcessedItemDto } from '../dtos/ProcessedItemDto';

export class ProcessSingleSvgFileUseCase {
  constructor(
    private readonly validator: ISvgValidator,
    private readonly converter: ISvgConverter
  ) {}

  public async execute(file: File): Promise<ProcessedItemDto> {
    const tempId = 'item_' + Math.random().toString(36).substring(2, 9);

    // 1. Validar y sanitizar con las 4 capas de seguridad
    const validationResult = await this.validator.validateFile(file);

    if (!validationResult.isValid || !validationResult.svgFile) {
      return {
        id: tempId,
        originalName: file.name,
        status: 'error',
        errorMessage: validationResult.error || 'El archivo no es un SVG válido.',
      };
    }

    const svgFile = validationResult.svgFile;

    // 2. Convertir a Android Vector Drawable
    try {
      const vectorDrawable = await this.converter.convert(svgFile);

      return {
        id: svgFile.id,
        originalName: svgFile.originalName,
        status: 'success',
        svgFile,
        vectorDrawable,
      };
    } catch (err) {
      return {
        id: svgFile.id,
        originalName: svgFile.originalName,
        status: 'error',
        svgFile,
        errorMessage: `Error en la conversión: ${(err as Error).message}`,
      };
    }
  }
}
