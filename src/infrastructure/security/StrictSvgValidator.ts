import type { ISvgValidator, SvgValidationResult } from '../../domain/ports/ISvgValidator';
import { SvgFile, type SvgFileMetadata } from '../../domain/entities/SvgFile';
import { SvgSanitizer } from './SvgSanitizer';

export class StrictSvgValidator implements ISvgValidator {
  private static readonly MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  public async validateFile(file: File): Promise<SvgValidationResult> {
    // 1. Capa 1: Validación de extensión de archivo
    const fileName = file.name || '';
    if (!fileName.toLowerCase().endsWith('.svg')) {
      return {
        isValid: false,
        error: `El archivo "${fileName}" no tiene una extensión .svg válida. Solo se permiten archivos SVG.`,
      };
    }

    // 2. Capa 2: Validación de tipo MIME (si el SO lo provee)
    if (file.type && file.type !== 'image/svg+xml' && file.type !== 'text/xml' && file.type !== 'application/xml') {
      return {
        isValid: false,
        error: `El tipo MIME "${file.type}" no corresponde a un archivo SVG legítimo.`,
      };
    }

    // 3. Validación de tamaño máximo (evitar DoS o bloqueos por memoria)
    if (file.size > StrictSvgValidator.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `El archivo supera el tamaño máximo permitido de 5 MB.`,
      };
    }

    if (file.size === 0) {
      return {
        isValid: false,
        error: `El archivo "${fileName}" está vacío.`,
      };
    }

    // Leer contenido como texto plano
    try {
      const rawContent = await file.text();
      return this.validateString(rawContent, fileName, file.size);
    } catch (err) {
      return {
        isValid: false,
        error: `No se pudo leer el contenido del archivo: ${(err as Error).message}`,
      };
    }
  }

  public validateString(rawContent: string, fileName = 'icon.svg', sizeBytes = 0): SvgValidationResult {
    const trimmed = rawContent.trim();
    if (!trimmed) {
      return { isValid: false, error: 'El contenido SVG está vacío.' };
    }

    // 4. Capa 3: Parseo XML estricto con DOMParser
    if (typeof DOMParser === 'undefined') {
      return { isValid: false, error: 'Entorno de ejecución no soporta DOMParser.' };
    }

    const parser = new DOMParser();
    let doc: Document;

    try {
      doc = parser.parseFromString(trimmed, 'application/xml');
    } catch (e) {
      return { isValid: false, error: `Error de parseo XML: ${(e as Error).message}` };
    }

    // Comprobar errores de parseo generados por el navegador
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        isValid: false,
        error: `El archivo no contiene un XML válido: ${parserError.textContent?.slice(0, 150) || 'Error de sintaxis'}`,
      };
    }

    // Comprobar que el elemento raíz sea <svg>
    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'svg') {
      return {
        isValid: false,
        error: 'El archivo XML no tiene un elemento raíz <svg>. Se ha rechazado por seguridad.',
      };
    }

    // 5. Capa 4: Sanitización profunda de scripts y nodos peligrosos
    const sanitizeResult = SvgSanitizer.sanitize(doc);
    if (!sanitizeResult.isClean) {
      return {
        isValid: false,
        error: sanitizeResult.reason || 'Se detectaron elementos o scripts no permitidos en el SVG.',
      };
    }

    const sanitizedSvgString = SvgSanitizer.serialize(doc);

    // Extraer dimensiones y viewBox
    const { width, height, viewportWidth, viewportHeight } = this.extractDimensions(root);

    const metadata: SvgFileMetadata = {
      id: this.generateUniqueId(),
      originalName: fileName,
      sanitizedAndroidName: SvgFile.toValidAndroidFileName(fileName),
      sizeBytes: sizeBytes || new TextEncoder().encode(trimmed).length,
      width,
      height,
      viewportWidth,
      viewportHeight,
      createdAt: new Date(),
    };

    const svgFile = new SvgFile(metadata.id, fileName, trimmed, sanitizedSvgString, metadata);

    return {
      isValid: true,
      sanitizedSvgString,
      svgFile,
    };
  }

  private extractDimensions(svgRoot: Element): {
    width: number;
    height: number;
    viewportWidth: number;
    viewportHeight: number;
  } {
    let width = parseFloat(svgRoot.getAttribute('width') || '');
    let height = parseFloat(svgRoot.getAttribute('height') || '');

    const viewBoxAttr = svgRoot.getAttribute('viewBox') || svgRoot.getAttribute('viewbox');
    let viewportWidth = width;
    let viewportHeight = height;

    if (viewBoxAttr) {
      const parts = viewBoxAttr
        .trim()
        .split(/[\s,]+/)
        .map((p) => parseFloat(p))
        .filter((n) => !isNaN(n));

      if (parts.length >= 4) {
        viewportWidth = parts[2];
        viewportHeight = parts[3];
      }
    }

    // Si faltaba width/height explícito, usar viewportWidth/viewportHeight
    if (isNaN(width) || width <= 0) {
      width = viewportWidth > 0 ? viewportWidth : 24;
    }
    if (isNaN(height) || height <= 0) {
      height = viewportHeight > 0 ? viewportHeight : 24;
    }

    if (isNaN(viewportWidth) || viewportWidth <= 0) {
      viewportWidth = width;
    }
    if (isNaN(viewportHeight) || viewportHeight <= 0) {
      viewportHeight = height;
    }

    return { width, height, viewportWidth, viewportHeight };
  }

  private generateUniqueId(): string {
    return 'svg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }
}
