import { ConverterAppPresenter } from './ConverterAppPresenter';
import { AppStateStore, type AppState } from '../state/AppStateStore';
import { FileItemRenderer } from '../components/FileItemRenderer';

export function bootstrapApp(): void {
  const presenter = new ConverterAppPresenter();
  const store = AppStateStore.getInstance();

  // Elementos DOM
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

  if (!dropzone || !fileInput || !filesListContainer) return;

  // 1. Gestión de selección de archivos (Input & Drag and Drop)
  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      presenter.handleFiles(fileInput.files);
      fileInput.value = ''; // Reset para permitir volver a cargar los mismos archivos si se desea
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-emerald-500', 'bg-slate-900/80');
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-emerald-500', 'bg-slate-900/80');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-emerald-500', 'bg-slate-900/80');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      presenter.handleFiles(e.dataTransfer.files);
    }
  });

  // 2. Acciones Globales
  btnExportZip?.addEventListener('click', () => presenter.handleExportAllZip());
  btnClearAll?.addEventListener('click', () => presenter.handleClearAll());

  // 3. Delegación de eventos en la lista de tarjetas
  filesListContainer.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    if (!id) return;

    if (action === 'copy') {
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

  // 4. Suscripción al almacén de estado (Patrón Observer)
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
