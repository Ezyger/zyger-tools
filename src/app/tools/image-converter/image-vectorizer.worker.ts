import type { VectorRequest, VectorResponse } from './image-vectorizer.model';
import { vectorizeImage } from './image-vectorizer.utils';

addEventListener('message', ({ data }: MessageEvent<VectorRequest>) => {
  try {
    postMessage({ type: 'result', svg: vectorizeImage(data) } satisfies VectorResponse);
  } catch (error) {
    postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Não foi possível vetorizar esta imagem.',
    } satisfies VectorResponse);
  }
});
