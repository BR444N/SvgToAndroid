import en from './locales/en.json';
import es from './locales/es.json';

export type SupportedLanguage = 'en' | 'es';

export class I18nService {
  private static instance: I18nService;
  private currentLang: SupportedLanguage = 'en';
  private static readonly STORAGE_KEY = 'svg2android_lang';

  private readonly translations: Record<SupportedLanguage, typeof en> = {
    en,
    es,
  };

  private constructor() {
    this.currentLang = this.loadCachedLanguage();
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLang;
  }

  public setLanguage(lang: SupportedLanguage): void {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    this.saveCachedLanguage(lang);
    this.updateDomTranslations();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app:language-changed', {
          detail: { language: lang },
        })
      );
    }
  }

  /**
   * Obtiene la traducción dada una clave jerárquica (ej: 'hero.title', 'card.copied')
   */
  public t(keyPath: string, params?: Record<string, string | number>): string {
    const keys = keyPath.split('.');
    let current: any = this.translations[this.currentLang];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback a inglés si la clave no existe en el idioma actual
        let fallback: any = this.translations['en'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return keyPath;
          }
        }
        current = fallback;
        break;
      }
    }

    if (typeof current !== 'string') {
      return keyPath;
    }

    // Reemplazo de parámetros dinámicos {param}
    if (params) {
      return current.replace(/{(\w+)}/g, (_, match) => {
        return params[match] !== undefined ? String(params[match]) : `{${match}}`;
      });
    }

    return current;
  }

  /**
   * Recorre el DOM buscando elementos con data-i18n y actualiza su contenido
   */
  public updateDomTranslations(): void {
    if (typeof document === 'undefined') return;

    const elements = document.querySelectorAll<HTMLElement>('[data-i18n]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // Actualizar atributos data-i18n-title
    const titleElements = document.querySelectorAll<HTMLElement>('[data-i18n-title]');
    titleElements.forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // Actualizar indicador de idioma en el botón del navbar
    const langBadge = document.getElementById('currentLangLabel');
    if (langBadge) {
      langBadge.textContent = this.currentLang.toUpperCase();
    }
  }

  private loadCachedLanguage(): SupportedLanguage {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'en';
    }

    const cached = localStorage.getItem(I18nService.STORAGE_KEY) as SupportedLanguage | null;
    if (cached === 'en' || cached === 'es') {
      return cached;
    }

    // Por defecto estricto: inglés
    return 'en';
  }

  private saveCachedLanguage(lang: SupportedLanguage): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(I18nService.STORAGE_KEY, lang);
    }
  }
}
