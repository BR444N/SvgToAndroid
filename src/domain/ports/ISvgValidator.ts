import type { SvgFile } from '../entities/SvgFile';

export interface SvgValidationResult {
  isValid: boolean;
  sanitizedSvgString?: string;
  error?: string;
  svgFile?: SvgFile;
}

export interface ISvgValidator {
  /**
   * Valida un archivo File proveniente del navegador.
   * Aplica las 4 capas de seguridad: Extensión, MIME, XML bien formado y sanitización anti-XSS.
   */
  validateFile(file: File): Promise<SvgValidationResult>;

  /**
   * Valida y sanitiza una cadena SVG de texto plano.
   */
  validateString(rawContent: string, fileName?: string): SvgValidationResult;
}
