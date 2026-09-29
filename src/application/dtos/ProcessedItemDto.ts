import type { SvgFile } from '../../domain/entities/SvgFile';
import type { VectorDrawable } from '../../domain/entities/VectorDrawable';

export type ProcessingStatus = 'pending' | 'processing' | 'success' | 'error';

export interface ProcessedItemDto {
  id: string;
  originalName: string;
  status: ProcessingStatus;
  svgFile?: SvgFile;
  vectorDrawable?: VectorDrawable;
  errorMessage?: string;
}
