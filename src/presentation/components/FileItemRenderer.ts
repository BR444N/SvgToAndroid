import type { ProcessedItemDto } from '../../application/dtos/ProcessedItemDto';

export class FileItemRenderer {
  /**
   * Genera el elemento HTML para una tarjeta de archivo.
   */
  public static renderCard(item: ProcessedItemDto, isCopied: boolean): HTMLElement {
    const card = document.createElement('div');
    card.id = `card-${item.id}`;
    card.className =
      'rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ' +
      (item.status === 'error'
        ? 'border-rose-900/50 bg-rose-950/20'
        : 'border-slate-800 bg-slate-900/70 hover:border-slate-700');

    if (item.status === 'error') {
      card.innerHTML = this.renderErrorCardHtml(item);
    } else {
      card.innerHTML = this.renderSuccessCardHtml(item, isCopied);
    }

    return card;
  }

  private static renderErrorCardHtml(item: ProcessedItemDto): string {
    return `
      <div class="p-4 sm:p-5 flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-rose-300 break-all">${this.escapeHtml(item.originalName)}</h4>
            <p class="text-xs text-rose-400/90 mt-1">${this.escapeHtml(item.errorMessage || 'Archivo no válido o rechazado por seguridad.')}</p>
          </div>
        </div>

        <button
          type="button"
          data-action="delete"
          data-id="${item.id}"
          class="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
          title="Eliminar de la lista"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    `;
  }

  private static renderSuccessCardHtml(item: ProcessedItemDto, isCopied: boolean): string {
    const svgFile = item.svgFile!;
    const vector = item.vectorDrawable!;
    const formattedSize = (svgFile.metadata.sizeBytes / 1024).toFixed(1) + ' KB';

    return `
      <div class="p-4 sm:p-5 flex flex-col gap-4">
        <!-- Fila Superior: Preview, Información y Acciones Directas -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <!-- Preview Gráfico del SVG en un contenedor aislado seguro -->
            <div class="w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700/60 p-2 flex items-center justify-center shrink-0 shadow-inner overflow-hidden text-emerald-400">
              <div class="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:fill-current">
                ${svgFile.sanitizedContent}
              </div>
            </div>

            <!-- Metadatos del Archivo -->
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-sm font-semibold text-emerald-400 truncate max-w-xs sm:max-w-sm">
                  ${this.escapeHtml(vector.fileName)}
                </span>
                <span class="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                  ${vector.options.widthDp}x${vector.options.heightDp} dp
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 truncate">
                Original: <span class="text-slate-300 font-mono">${this.escapeHtml(item.originalName)}</span> • ${formattedSize}
              </p>
            </div>
          </div>

          <!-- Botones de Acción (Copiar, Descargar, Borrar 1-click) -->
          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <!-- Botón Copiar Código -->
            <button
              type="button"
              data-action="copy"
              data-id="${item.id}"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                isCopied
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600'
              }"
              title="Copiar código XML al portapapeles"
            >
              ${
                isCopied
                  ? `<svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>¡Copiado!</span>`
                  : `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg><span>Copiar</span>`
              }
            </button>

            <!-- Botón Descargar Individual -->
            <button
              type="button"
              data-action="download"
              data-id="${item.id}"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              title="Descargar este archivo XML"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Descargar</span>
            </button>

            <!-- Botón Alternar Visor XML -->
            <button
              type="button"
              data-action="toggle-code"
              data-id="${item.id}"
              class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
              title="Ver código XML"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </button>

            <!-- Botón Borrar (1 Clic) -->
            <button
              type="button"
              data-action="delete"
              data-id="${item.id}"
              class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 transition-all duration-200"
              title="Eliminar archivo (1 clic)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Visor Plegable de Código XML -->
        <div id="code-viewer-${item.id}" class="hidden mt-2 pt-3 border-t border-slate-800">
          <div class="relative rounded-xl bg-slate-950/80 border border-slate-800/90 p-3 overflow-x-auto max-h-56">
            <pre class="font-mono text-xs text-emerald-300 leading-relaxed"><code>${this.escapeHtml(vector.xmlContent)}</code></pre>
          </div>
        </div>
      </div>
    `;
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
