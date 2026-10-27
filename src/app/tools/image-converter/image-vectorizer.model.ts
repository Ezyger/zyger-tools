export const MAX_VECTOR_PIXELS = 4_000_000;
export const VECTOR_COLORS = [4, 8, 16, 32, 64];
export type VectorDetail = 'fine' | 'balanced' | 'smooth';
export interface VectorSettings {
  colors: number;
  detail: VectorDetail;
}
export interface VectorRequest {
  image: Pick<ImageData, 'data' | 'width' | 'height'>;
  settings: VectorSettings;
}
export type VectorResponse = { type: 'result'; svg: string } | { type: 'error'; message: string };
