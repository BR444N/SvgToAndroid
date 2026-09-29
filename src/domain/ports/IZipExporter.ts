import type { VectorDrawable } from '../entities/VectorDrawable';

export interface IZipExporter {
  /**
   * Empaqueta un lote de VectorDrawables en un archivo ZIP y lo descarga en el navegador.
   * @param drawables Lista de vectores a incluir.
   * @param zipFileName Nombre del archivo ZIP resultante (ej: 'android_vectors.zip').
   */
  exportZip(drawables: VectorDrawable[], zipFileName?: string): Promise<void>;
}
