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
import { I18nService } from '../i18n/I18nService';

export class ConverterAppPresenter {
  private readonly store: AppStateStore;
  private readonly processSingleFileUseCase: ProcessSingleSvgFileUseCase;
  private readonly exportAllZipUseCase: ExportAllAsZipUseCase;
  private readonly copyXmlUseCase: CopyXmlToClipboardUseCase;
  private readonly downloadSingleXmlUseCase: DownloadSingleXmlUseCase;
  private readonly i18n: I18nService;

  constructor() {
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
    this.i18n = I18nService.getInstance();
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
        this.showToast(`Error: ${file.name}`, 'error');
      } finally {
        this.store.incrementProcessed();
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
    }

    this.store.finishQueue();
    this.showToast(this.i18n.t('toasts.batchProcessed', { count: files.length }), 'info');
  }

  /**
   * Copia el código XML del vector al portapapeles.
   */
  public async handleCopyXml(id: string): Promise<boolean> {
    const item = this.store.getItemById(id);
    if (!item || !item.vectorDrawable) {
      this.showToast(this.i18n.t('toasts.xmlNotFound'), 'error');
      return false;
    }

    const success = await this.copyXmlUseCase.execute(item.vectorDrawable.xmlContent);
    if (success) {
      this.store.setLastCopiedId(id);
      this.showToast(this.i18n.t('toasts.codeCopied', { name: item.vectorDrawable.fileName }), 'success');
      setTimeout(() => {
        if (this.store.getState().lastCopiedId === id) {
          this.store.setLastCopiedId(null);
        }
      }, 2500);
    } else {
      this.showToast(this.i18n.t('toasts.clipboardError'), 'error');
    }
    return success;
  }

  /**
   * Descarga un archivo XML individualmente.
   */
  public handleDownloadSingle(id: string): void {
    const item = this.store.getItemById(id);
    if (!item || !item.vectorDrawable) {
      this.showToast(this.i18n.t('toasts.xmlNotFound'), 'error');
      return;
    }

    this.downloadSingleXmlUseCase.execute(item.vectorDrawable);
    this.showToast(this.i18n.t('toasts.downloading', { name: item.vectorDrawable.fileName }), 'info');
  }

  /**
   * Elimina un elemento de la cola con 1 solo clic.
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
      this.showToast(this.i18n.t('toasts.zipEmpty'), 'error');
      return;
    }

    try {
      this.showToast(this.i18n.t('toasts.zipZipping', { count: drawables.length }), 'info');
      await this.exportAllZipUseCase.execute(drawables, 'android_vector_drawables.zip');
      this.showToast(this.i18n.t('toasts.zipReady'), 'success');
    } catch (err) {
      this.showToast(`Error ZIP: ${(err as Error).message}`, 'error');
    }
  }

  /**
   * Limpia toda la lista de archivos.
   */
  public handleClearAll(): void {
    const count = this.store.getState().items.length;
    if (count === 0) return;
    this.store.clearAll();
    this.showToast(this.i18n.t('toasts.listCleared'), 'info');
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
