import type { ProcessedItemDto } from '../../application/dtos/ProcessedItemDto';

export class FileItemRenderer {
  /**
   * Genera el elemento HTML para una tarjeta de archivo en blanco y negro con bordes redondeados.
   */
  public static renderCard(item: ProcessedItemDto, isCopied: boolean): HTMLElement {
    const card = document.createElement('div');
    card.id = `card-${item.id}`;
    card.className =
      'rounded-3xl border transition-all duration-200 overflow-hidden backdrop-blur-md ' +
      (item.status === 'error'
        ? 'border-white/15 bg-black/50'
        : 'border-white/10 bg-black/60 hover:border-white/20');

    if (item.status === 'error') {
      card.innerHTML = this.renderErrorCardHtml(item);
    } else {
      card.innerHTML = this.renderSuccessCardHtml(item, isCopied);
    }

    return card;
  }

  private static renderErrorCardHtml(item: ProcessedItemDto): string {
    return `
      <div class="p-5 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-medium text-white truncate">${this.escapeHtml(item.originalName)}</h4>
            <p class="text-xs text-white/40 mt-0.5 truncate">${this.escapeHtml(item.errorMessage || 'No se pudo procesar este archivo.')}</p>
          </div>
        </div>

        <button
          type="button"
          data-action="delete"
          data-id="${item.id}"
          class="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          title="Eliminar de la lista"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
      <div class="p-5 sm:p-6 flex flex-col gap-4">
        <!-- Fila Principal: Preview Ampliado + Información + Botones de Acción -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div class="flex items-center gap-5 min-w-0">
            <!-- Preview Gráfico Interactivo: Al hacer clic abre la vista extendida con zoom -->
            <button
              type="button"
              data-action="open-modal"
              data-id="${item.id}"
              class="group relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-neutral-950 border border-white/10 hover:border-white/30 p-3 sm:p-3.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner cursor-zoom-in transition-all duration-200 hover:scale-[1.03] text-left"
              title="Haz clic para inspeccionar detalles y ampliar con zoom"
            >
              <div class="w-full h-full flex items-center justify-center text-white pointer-events-none [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto">
                ${svgFile.sanitizedContent}
              </div>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl pointer-events-none">
                <svg class="w-5 h-5 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </button>

            <!-- Metadatos del Archivo -->
            <div class="min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="font-mono text-sm sm:text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
                  ${this.escapeHtml(vector.fileName)}
                </span>
                <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10 font-mono">
                  ${vector.options.widthDp}×${vector.options.heightDp} dp
                </span>
              </div>
              <p class="text-xs text-white/40 mt-1.5 truncate">
                <span class="text-white/60 font-mono">${this.escapeHtml(item.originalName)}</span> • ${formattedSize}
              </p>
            </div>
          </div>

          <!-- Acciones de Usuario (Bordes redondeados completos) -->
          <div class="flex items-center gap-2 self-end sm:self-center shrink-0">
            <!-- Botón Copiar Código (1 Clic) -->
            <button
              type="button"
              data-action="copy"
              data-id="${item.id}"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isCopied
                  ? 'bg-white text-black shadow-lg shadow-white/10'
                  : 'bg-white text-black hover:bg-neutral-200'
              }"
              title="Copiar código XML"
            >
              ${
                isCopied
                  ? `<svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg><span>¡Copiado!</span>`
                  : `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg><span>Copiar</span>`
              }
            </button>

            <!-- Botón Descargar Individual -->
            <button
              type="button"
              data-action="download"
              data-id="${item.id}"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors cursor-pointer"
              title="Descargar este archivo XML"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Descargar</span>
            </button>

            <!-- Botón Alternar Visor XML -->
            <button
              type="button"
              data-action="toggle-code"
              data-id="${item.id}"
              class="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
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
              class="p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition-all cursor-pointer"
              title="Eliminar de la lista"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Visor Plegable de Código XML -->
        <div id="code-viewer-${item.id}" class="hidden mt-2 pt-3 border-t border-white/10">
          <div class="relative rounded-2xl bg-neutral-950 border border-white/10 p-4 overflow-x-auto max-h-60">
            <pre class="font-mono text-xs text-neutral-300 leading-relaxed"><code>${this.escapeHtml(vector.xmlContent)}</code></pre>
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
