import type { IClipboardService } from '../../domain/ports/IClipboardService';

export class BrowserClipboardService implements IClipboardService {
  public async copyText(text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // En caso de fallo por permisos, continuar con el fallback
      }
    }

    // Fallback para navegadores antiguos o contextos no seguros
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }
}
