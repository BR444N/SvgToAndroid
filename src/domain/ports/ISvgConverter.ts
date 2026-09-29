import type { SvgFile } from '../entities/SvgFile';
import type { VectorDrawable, VectorDrawableOptions } from '../entities/VectorDrawable';

export interface SvgConvertOptions extends Partial<VectorDrawableOptions> {
  overrideWidth?: number;
  overrideHeight?: number;
}

export interface ISvgConverter {
  /**
   * Convierte una entidad SvgFile validada a un VectorDrawable de Android.
   */
  convert(svgFile: SvgFile, options?: SvgConvertOptions): Promise<VectorDrawable>;
}
