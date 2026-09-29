import { ConverterAppPresenter } from './ConverterAppPresenter';
import { AppStateStore, type AppState } from '../state/AppStateStore';
import { FileItemRenderer } from '../components/FileItemRenderer';

export function bootstrapApp(): void {
  const presenter = new ConverterAppPresenter();
  const store = AppStateStore.getInstance();

  // Elementos DOM principales
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
  const filesListContainer = document.getElementById('filesListContainer');
  const emptyState = document.getElementById('emptyState');
  const globalActionsSection = document.getElementById('globalActionsSection');
  const btnExportZip = document.getElementById('btnExportZip');
  const btnClearAll = document.getElementById('btnClearAll');
  const totalBadge = document.getElementById('totalBadge');
  const convertedBadge = document.getElementById('convertedBadge');
  const errorBadge = document.getElementById('errorBadge');
  const errorBadgeContainer = document.getElementById('errorBadgeContainer');
  const progressContainer = document.getElementById('queueProgressContainer');
  const progressBar = document.getElementById('queueProgressBar');
  const floatingNavbar = document.getElementById('floatingNavbar');

  // Elementos del Modal de Inspección con Zoom
  const previewModal = document.getElementById('previewModal');
  const previewModalCard = document.getElementById('previewModalCard');
  const modalTitle = document.getElementById('modalTitle');
  const modalDimensionsBadge = document.getElementById('modalDimensionsBadge');
  const modalSvgWrapper = document.getElementById('modalSvgWrapper');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnResetZoom = document.getElementById('btnResetZoom');
  const zoomPercentBadge = document.getElementById('zoomPercentBadge');

  if (!dropzone || !fileInput || !filesListContainer) return;

  // ==========================================
  // 1. Navbar Flotante: Ocultar al desplazarse hacia abajo
  // ==========================================
  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (floatingNavbar) {
          if (currentScrollY > 70 && currentScrollY > lastScrollY) {
            // Desplazamiento hacia abajo: ocultar navbar
            floatingNavbar.classList.add('-translate-y-28', 'opacity-0', 'pointer-events-none');
            floatingNavbar.classList.remove('translate-y-0', 'opacity-100');
          } else {
            // Desplazamiento hacia arriba o cerca del inicio: mostrar navbar
            floatingNavbar.classList.remove('-translate-y-28', 'opacity-0', 'pointer-events-none');
            floatingNavbar.classList.add('translate-y-0', 'opacity-100');
          }
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  });

  // ==========================================
  // 2. Lógica del Modal con Zoom (+, -, Reset)
  // ==========================================
  let currentZoom = 1.0;
  const MIN_ZOOM = 0.3;
  const MAX_ZOOM = 6.0;
  const ZOOM_STEP = 0.25;

  function updateZoom(newZoom: number): void {
    currentZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat(newZoom.toFixed(2))));
    if (modalSvgWrapper) {
      modalSvgWrapper.style.transform = `scale(${currentZoom})`;
    }
    if (zoomPercentBadge) {
      zoomPercentBadge.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  }

  function openPreviewModal(id: string): void {
    const item = store.getItemById(id);
    if (!item || !item.svgFile || !item.vectorDrawable || !previewModal) return;

    if (modalTitle) modalTitle.textContent = item.vectorDrawable.fileName;
    if (modalDimensionsBadge) {
      modalDimensionsBadge.textContent = `${item.vectorDrawable.options.widthDp}×${item.vectorDrawable.options.heightDp} dp`;
    }
    if (modalSvgWrapper) {
      modalSvgWrapper.innerHTML = item.svgFile.sanitizedContent;
    }

    updateZoom(1.0); // Inicia en 100% (modo normal)

    previewModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      previewModal.classList.remove('opacity-0');
      previewModalCard?.classList.remove('scale-95');
      previewModalCard?.classList.add('scale-100');
    });
    document.body.style.overflow = 'hidden';
  }

  function closePreviewModal(): void {
    if (!previewModal) return;
    previewModal.classList.add('opacity-0');
    previewModalCard?.classList.remove('scale-100');
    previewModalCard?.classList.add('scale-95');

    setTimeout(() => {
      previewModal.classList.add('hidden');
      if (modalSvgWrapper) modalSvgWrapper.innerHTML = '';
      document.body.style.overflow = '';
    }, 200);
  }

  // Controles de zoom
  btnZoomIn?.addEventListener('click', () => updateZoom(currentZoom + ZOOM_STEP));
  btnZoomOut?.addEventListener('click', () => updateZoom(currentZoom - ZOOM_STEP));
  btnResetZoom?.addEventListener('click', () => updateZoom(1.0));

  // Zoom con rueda de ratón dentro del modal
  modalSvgWrapper?.parentElement?.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      updateZoom(currentZoom + 0.15);
    } else {
      updateZoom(currentZoom - 0.15);
    }
  }, { passive: false });

  // Cerrar modal
  btnCloseModal?.addEventListener('click', closePreviewModal);

  previewModal?.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      closePreviewModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal && !previewModal.classList.contains('hidden')) {
      closePreviewModal();
    }
  });

  // ==========================================
  // 3. Selección y Procesamiento de Archivos
  // ==========================================
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      presenter.handleFiles(fileInput.files);
      fileInput.value = '';
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-white/50', 'bg-black/80');
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-white/50', 'bg-black/80');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-white/50', 'bg-black/80');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      presenter.handleFiles(e.dataTransfer.files);
    }
  });

  // ==========================================
  // 4. Acciones Globales
  // ==========================================
  btnExportZip?.addEventListener('click', () => presenter.handleExportAllZip());
  btnClearAll?.addEventListener('click', () => presenter.handleClearAll());

  // ==========================================
  // 5. Delegación de eventos en las tarjetas
  // ==========================================
  filesListContainer.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    if (!id) return;

    if (action === 'open-modal') {
      openPreviewModal(id);
    } else if (action === 'copy') {
      presenter.handleCopyXml(id);
    } else if (action === 'download') {
      presenter.handleDownloadSingle(id);
    } else if (action === 'delete') {
      presenter.handleDeleteSingle(id);
    } else if (action === 'toggle-code') {
      const codeViewer = document.getElementById(`code-viewer-${id}`);
      if (codeViewer) {
        codeViewer.classList.toggle('hidden');
      }
    }
  });

  // ==========================================
  // 6. Suscripción Reactiva al Store
  // ==========================================
  store.subscribe((state: AppState) => {
    // Actualizar barra de progreso
    if (state.isProcessing && state.totalInQueue > 0) {
      progressContainer?.classList.remove('hidden');
      const percent = Math.round((state.processedCount / state.totalInQueue) * 100);
      if (progressBar) progressBar.style.width = `${percent}%`;
    } else {
      progressContainer?.classList.add('hidden');
      if (progressBar) progressBar.style.width = '0%';
    }

    // Actualizar contadores
    const totalCount = state.items.length;
    const successCount = state.items.filter((i) => i.status === 'success').length;
    const errorCount = state.items.filter((i) => i.status === 'error').length;

    if (totalBadge) totalBadge.textContent = totalCount.toString();
    if (convertedBadge) convertedBadge.textContent = successCount.toString();
    if (errorBadge) errorBadge.textContent = errorCount.toString();

    if (errorCount > 0) {
      errorBadgeContainer?.classList.remove('hidden');
      errorBadgeContainer?.classList.add('flex');
    } else {
      errorBadgeContainer?.classList.add('hidden');
      errorBadgeContainer?.classList.remove('flex');
    }

    // Mostrar/ocultar barra de acciones globales y estado vacío
    if (totalCount > 0) {
      globalActionsSection?.classList.remove('hidden');
      globalActionsSection?.classList.add('flex');
      emptyState?.classList.add('hidden');
    } else {
      globalActionsSection?.classList.add('hidden');
      globalActionsSection?.classList.remove('flex');
      emptyState?.classList.remove('hidden');
    }

    // Renderizar tarjetas
    filesListContainer.innerHTML = '';
    for (const item of state.items) {
      const isCopied = state.lastCopiedId === item.id;
      const card = FileItemRenderer.renderCard(item, isCopied);
      filesListContainer.appendChild(card);
    }
  });
}
