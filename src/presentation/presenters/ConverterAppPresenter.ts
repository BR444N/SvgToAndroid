import { StrictSvgValidator } from '../../infrastructure/security/StrictSvgValidator';
import { SvgToAndroidConverter } from '../../infrastructure/converter/SvgToAndroidConverter';
import { BrowserZipExporter } from '../../infrastructure/services/BrowserZipExporter';
import { BrowserClipboardService } from '../../infrastructure/services/BrowserClipboardService';
import { BrowserDownloadService } from '../../infrastructure/services/BrowserDownloadService';
import { ProcessSingleSvgFileUseCase } from '../../application/use-cases/ProcessSingleSvgFileUseCase';
import { ExportAllAsZipUseCase } from '../../application/use-cases/ExportAllAsZipUseCase';
import { CopyXmlToClipboardUseCase } from '../../application/use-cases/CopyXmlToClipboardUseCase';
import { DownloadSingleXmlUseCase } from '../../application/use-cases/DownloadSingleXmlUseCase';
import { AppStateStore } from '../state/AppStateStore';

export class ConverterAppPresenter {
  private readonly store: AppStateStore;
  private readonly processSingleFileUseCase: ProcessSingleSvgFileUseCase;
  private readonly exportAllZipUseCase: ExportAllAsZipUseCase;
  private readonly copyXmlUseCase: CopyXmlToClipboardUseCase;
  private readonly downloadSingleXmlUseCase: DownloadSingleXmlUseCase;

  constructor() {
    // Inyección de dependencias (Principio D - Dependency Inversion)
    const validator = new StrictSvgValidator();
    const converter = new SvgToAndroidConverter();
    const zipExporter = new BrowserZipExporter();
    const clipboardService = new BrowserClipboardService();
    const downloadService = new BrowserDownloadService();

    this.processSingleFileUseCase = new ProcessSingleSvgFileUseCase(validator, converter);
    this.exportAllZipUseCase = new ExportAllAsZipUseCase(zipExporter);
    this.copyXmlUseCase = new CopyXmlToClipboardUseCase(clipboardService);
    this.downloadSingleXmlUseCase = new DownloadSingleXmlUseCase(downloadService);
    this.store = AppStateStore.getInstance();
  }

  /**
   * Procesa una lista de archivos secuencialmente (uno a uno) para garantizar
   * orden, validación estricta y feedback en tiempo real sin bloquear la interfaz.
   */
  public async handleFiles(fileList: FileList | File[]): Promise<void> {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    this.store.startQueue(files.length);

    for (const file of files) {
      try {
        const result = await this.processSingleFileUseCase.execute(file);
        this.store.addItem(result);
      } catch (err) {
        this.showToast(`Error inesperado al procesar ${file.name}`, 'error');
      } finally {
        this.store.incrementProcessed();
        // Pequeño descanso de ciclo de eventos para permitir renderizado suave
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }

    this.store.finishQueue();
    this.showToast(`Se han procesado ${files.length} archivo(s).`, 'info');
  }

  /**
   * Copia el código XML del vector al portapapeles.
   */
  public async handleCopyXml(id: string): Promise<boolean> {
    const item = this.store.getItemById(id);
    if (!item || !item.vectorDrawable) {
      this.showToast('No se encontró el XML a copiar.', 'error');
      return false;
    }

    const success = await this.copyXmlUseCase.execute(item.vectorDrawable.xmlContent);
    if (success) {
      this.store.setLastCopiedId(id);
      this.showToast(`¡Código de "${item.vectorDrawable.fileName}" copiado!`, 'success');
      setTimeout(() => {
        if (this.store.getState().lastCopiedId === id) {
          this.store.setLastCopiedId(null);
        }
      }, 2500);
    } else {
      this.showToast('No se pudo acceder al portapapeles.', 'error');
    }
    return success;
  }

  /**
   * Descarga un archivo XML individualmente.
   */
  public handleDownloadSingle(id: string): void {
    const item = this.store.getItemById(id);
    if (!item || !item.vectorDrawable) {
      this.showToast('No se encontró el archivo para descargar.', 'error');
      return;
    }

    this.downloadSingleXmlUseCase.execute(item.vectorDrawable);
    this.showToast(`Descargando ${item.vectorDrawable.fileName}...`, 'info');
  }

  /**
   * Elimina un elemento de la cola con 1 solo clic (ideal si solo querían copiar el código).
   */
  public handleDeleteSingle(id: string): void {
    this.store.removeItem(id);
  }

  /**
   * Exporta todos los archivos convertidos en un archivo ZIP.
   */
  public async handleExportAllZip(): Promise<void> {
    const drawables = this.store.getSuccessDrawables();
    if (drawables.length === 0) {
      this.showToast('No hay archivos convertidos disponibles para exportar.', 'error');
      return;
    }

    try {
      this.showToast(`Comprimiendo ${drawables.length} archivos en ZIP...`, 'info');
      await this.exportAllZipUseCase.execute(drawables, 'android_vector_drawables.zip');
      this.showToast('¡Descarga ZIP iniciada!', 'success');
    } catch (err) {
      this.showToast(`Error al exportar ZIP: ${(err as Error).message}`, 'error');
    }
  }

  /**
   * Limpia toda la lista de archivos.
   */
  public handleClearAll(): void {
    const count = this.store.getState().items.length;
    if (count === 0) return;
    this.store.clearAll();
    this.showToast('Se han eliminado todos los archivos de la lista.', 'info');
  }

  /**
   * Muestra un mensaje toast global en la interfaz.
   */
  public showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const event = new CustomEvent('app:toast', {
      detail: { message, type },
    });
    window.dispatchEvent(event);
  }
}
