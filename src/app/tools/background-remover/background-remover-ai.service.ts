import { Injectable, OnDestroy } from '@angular/core';
import { AI_INPUT_SIZE, AiWorkerResponse, applyAlphaMask } from './background-remover-ai.utils';

@Injectable()
export class BackgroundRemoverAi implements OnDestroy {
  private static readonly PROCESSING_TIMEOUT_MS = 300_000;

  private worker: Worker | null = null;
  private workerBackend: 'webgpu' | 'wasm' = 'wasm';
  private rejectPending: ((reason: Error) => void) | null = null;

  /**
   * Executa a IA em uma thread separada e aplica a máscara na resolução original.
   */
  public async remove(source: ImageData, progress: (message: string) => void): Promise<Uint8ClampedArray> {
    if (this.rejectPending) throw new Error('Já existe um recorte em andamento.');
    if (typeof Worker === 'undefined') throw new Error('Seu navegador não suporta o modo IA. Use o modo por cor.');
    const original = document.createElement('canvas');
    original.width = source.width;
    original.height = source.height;
    const originalContext = original.getContext('2d');
    if (!originalContext) throw new Error('Não foi possível preparar a imagem.');
    originalContext.putImageData(source, 0, 0);
    const reduced = document.createElement('canvas');
    reduced.width = AI_INPUT_SIZE;
    reduced.height = AI_INPUT_SIZE;
    const context = reduced.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a imagem.');
    context.drawImage(original, 0, 0, AI_INPUT_SIZE, AI_INPUT_SIZE);
    const input = context.getImageData(0, 0, AI_INPUT_SIZE, AI_INPUT_SIZE).data;
    const mask = await this.runModel(input, progress);
    if (mask.length !== AI_INPUT_SIZE ** 2) throw new Error('A IA retornou um recorte inválido. Tente novamente.');
    const maskImage = context.createImageData(AI_INPUT_SIZE, AI_INPUT_SIZE);
    for (let pixel = 0; pixel < mask.length; pixel++) {
      maskImage.data.set([mask[pixel], mask[pixel], mask[pixel], 255], pixel * 4);
    }
    context.putImageData(maskImage, 0, 0);
    originalContext.clearRect(0, 0, source.width, source.height);
    originalContext.imageSmoothingEnabled = true;
    originalContext.imageSmoothingQuality = 'high';
    originalContext.drawImage(reduced, 0, 0, source.width, source.height);
    return applyAlphaMask(source.data, originalContext.getImageData(0, 0, source.width, source.height).data);
  }

  /**
   * Interrompe downloads e cálculos pendentes, liberando também a memória do modelo.
   */
  public cancel(): void {
    this.worker?.terminate();
    this.worker = null;
    this.rejectPending?.(new Error('O recorte foi cancelado. Tente novamente.'));
  }

  /**
   * Libera o modelo e interrompe tarefas quando a ferramenta é destruída.
   */
  public ngOnDestroy(): void {
    this.cancel();
  }

  /**
   * A alternativa WASM usa um Worker novo, sem reutilizar uma inicialização de GPU inválida.
   */
  private async runModel(
    input: Uint8ClampedArray,
    progress: (message: string) => void,
    forceCpu = false,
  ): Promise<Uint8ClampedArray> {
    if (!this.worker) {
      this.workerBackend = !forceCpu && 'gpu' in navigator ? 'webgpu' : 'wasm';
      this.worker =
        this.workerBackend === 'webgpu'
          ? new Worker(new URL('./background-remover.worker', import.meta.url), { type: 'module' })
          : new Worker(new URL('./background-remover-wasm.worker', import.meta.url), { type: 'module' });
    }
    const worker = this.worker;
    const backend = this.workerBackend;
    return new Promise<Uint8ClampedArray>((resolve, reject) => {
      const timeout = setTimeout(() => this.cancel(), BackgroundRemoverAi.PROCESSING_TIMEOUT_MS);
      const finish = (): void => {
        clearTimeout(timeout);
        this.rejectPending = null;
        worker.onmessage = null;
        worker.onerror = null;
      };
      this.rejectPending = (error) => {
        finish();
        reject(error);
      };
      worker.onmessage = ({ data }: MessageEvent<AiWorkerResponse>) => {
        if (data.type === 'progress') {
          progress(data.message);
        } else if (data.type === 'error') {
          finish();
          worker.terminate();
          this.worker = null;
          if (backend === 'webgpu' && data.retryWithCpu) {
            progress('Tentando um modo de processamento compatível com seu dispositivo…');
            resolve(this.runModel(input, progress, true));
          } else {
            reject(new Error(data.message));
          }
        } else {
          finish();
          resolve(data.mask);
        }
      };
      worker.onerror = () => {
        finish();
        worker.terminate();
        this.worker = null;
        if (backend === 'webgpu') {
          progress('Tentando um modo de processamento compatível com seu dispositivo…');
          resolve(this.runModel(input, progress, true));
        } else {
          reject(new Error('O recorte com IA foi interrompido. Tente novamente ou use o modo por cor.'));
        }
      };
      try {
        const transferred = input.slice();
        worker.postMessage(transferred, [transferred.buffer]);
      } catch {
        finish();
        worker.terminate();
        this.worker = null;
        reject(new Error('Não foi possível iniciar o recorte. Tente novamente ou use o modo por cor.'));
      }
    });
  }
}
