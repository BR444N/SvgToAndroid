import type { ProcessedItemDto } from '../../application/dtos/ProcessedItemDto';
import type { VectorDrawable } from '../../domain/entities/VectorDrawable';

export interface AppState {
  items: ProcessedItemDto[];
  isProcessing: boolean;
  totalInQueue: number;
  processedCount: number;
  lastCopiedId: string | null;
}

type StateListener = (state: AppState) => void;

export class AppStateStore {
  private static instance: AppStateStore;
  private state: AppState = {
    items: [],
    isProcessing: false,
    totalInQueue: 0,
    processedCount: 0,
    lastCopiedId: null,
  };

  private listeners: Set<StateListener> = new Set();

  private constructor() {}

  public static getInstance(): AppStateStore {
    if (!AppStateStore.instance) {
      AppStateStore.instance = new AppStateStore();
    }
    return AppStateStore.instance;
  }

  public getState(): AppState {
    return { ...this.state, items: [...this.state.items] };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  public startQueue(total: number): void {
    this.state.isProcessing = true;
    this.state.totalInQueue = total;
    this.state.processedCount = 0;
    this.notify();
  }

  public incrementProcessed(): void {
    this.state.processedCount++;
    if (this.state.processedCount >= this.state.totalInQueue) {
      this.state.isProcessing = false;
    }
    this.notify();
  }

  public finishQueue(): void {
    this.state.isProcessing = false;
    this.notify();
  }

  public addItem(item: ProcessedItemDto): void {
    // Añadimos al principio para que los más nuevos aparezcan primero
    this.state.items = [item, ...this.state.items];
    this.notify();
  }

  public removeItem(id: string): void {
    this.state.items = this.state.items.filter((item) => item.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.state.items = [];
    this.state.totalInQueue = 0;
    this.state.processedCount = 0;
    this.notify();
  }

  public setLastCopiedId(id: string | null): void {
    this.state.lastCopiedId = id;
    this.notify();
  }

  public getSuccessDrawables(): VectorDrawable[] {
    return this.state.items
      .filter((item) => item.status === 'success' && item.vectorDrawable)
      .map((item) => item.vectorDrawable as VectorDrawable);
  }

  public getItemById(id: string): ProcessedItemDto | undefined {
    return this.state.items.find((item) => item.id === id);
  }
}
