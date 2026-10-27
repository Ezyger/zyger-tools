import { Injectable, OnDestroy } from '@angular/core';
import type { VectorRequest, VectorResponse, VectorSettings } from './image-vectorizer.model';

@Injectable()
export class ImageVectorizer implements OnDestroy {
  private static readonly PROCESSING_TIMEOUT_MS = 120_000;

  private worker: Worker | null = null;
  private rejectPending: ((error: Error) => void) | null = null;

  /**
   * Mantém a interface responsiva durante o traçado, que pode ser cancelado.
   */
  public vectorize(image: ImageData, settings: VectorSettings): Promise<string> {
    if (this.worker) return Promise.reject(new Error('Já existe uma vetorização em andamento.'));
    if (typeof Worker === 'undefined')
      return Promise.reject(new Error('Seu navegador não suporta vetorização. Use o modo incorporar.'));
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./image-vectorizer.worker', import.meta.url), { type: 'module' });
      this.worker = worker;
      const timeout = setTimeout(() => this.cancel(), ImageVectorizer.PROCESSING_TIMEOUT_MS);
      const finish = (): void => {
        clearTimeout(timeout);
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
        this.worker = null;
        this.rejectPending = null;
      };
      this.rejectPending = (error) => {
        finish();
        reject(error);
      };
      worker.onmessage = ({ data }: MessageEvent<VectorResponse>) => {
        finish();
        if (data.type === 'result') resolve(data.svg);
        else reject(new Error(data.message));
      };
      worker.onerror = () => {
        finish();
        reject(new Error('Não foi possível vetorizar. Tente uma imagem menor ou use o modo incorporar.'));
      };
      try {
        const request: VectorRequest = { image: { data: image.data, width: image.width, height: image.height }, settings };
        worker.postMessage(request, [image.data.buffer]);
      } catch {
        finish();
        reject(new Error('Não foi possível iniciar a vetorização.'));
      }
    });
  }

  /**
   * Cancela o traçado pendente e libera o Worker associado.
   */
  public cancel(): void {
    this.rejectPending?.(new Error('A vetorização foi cancelada.'));
  }

  /**
   * Interrompe o processamento quando a ferramenta é destruída.
   */
  public ngOnDestroy(): void {
    this.cancel();
  }
}
