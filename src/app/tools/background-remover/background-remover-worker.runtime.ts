import type * as Ort from 'onnxruntime-web';
import { AI_INPUT_SIZE, AI_MODEL_URL, AiWorkerResponse, logitsToMask, normalizeAiInput } from './background-remover-ai.utils';

/**
 * Configura o processamento isolado de um backend e comunica progresso, resultado ou falha à interface.
 */
export function registerBackgroundWorker(ort: typeof Ort, backend: 'webgpu' | 'wasm'): void {
  let session: Ort.InferenceSession | null = null;

  function report(message: string): void {
    postMessage({ type: 'progress', message } satisfies AiWorkerResponse);
  }

  async function loadModel(): Promise<Uint8Array> {
    let cache: Cache | undefined;
    try {
      cache = await caches.open('zyger-background-model-v1');
      const cached = await cache.match(AI_MODEL_URL);
      if (cached) return new Uint8Array(await cached.arrayBuffer());
    } catch {
      // O recorte também funciona quando o navegador não permite cache persistente.
    }
    const response = await fetch(AI_MODEL_URL, { signal: AbortSignal.timeout(180_000) });
    if (!response.ok || !response.body)
      throw new Error('Não foi possível baixar o modelo. Verifique sua conexão e tente novamente.');
    const total = Number(response.headers.get('content-length'));
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;
    let reportedMegabytes = -1;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      const megabytes = Math.round(loaded / 1_000_000);
      if (megabytes !== reportedMegabytes) {
        reportedMegabytes = megabytes;
        report(`Baixando modelo de IA: ${megabytes} MB${total ? ` de ${Math.round(total / 1_000_000)} MB` : ''}…`);
      }
    }
    const bytes = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    if (cache) {
      try {
        await cache.put(AI_MODEL_URL, new Response(bytes));
      } catch {
        // Falta de espaço para cache não impede o uso do modelo já baixado.
      }
    }
    return bytes;
  }

  async function getSession(): Promise<Ort.InferenceSession> {
    if (session) return session;
    report('Carregando modelo de IA…');
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = new URL('assets/onnx/1.30.0/', self.location.origin + '/').href;
    const bytes = await loadModel();
    report('Preparando o recorte. Isso pode levar alguns instantes…');
    session = await ort.InferenceSession.create(bytes, { executionProviders: [backend] });
    return session;
  }

  addEventListener('message', async ({ data }: MessageEvent<Uint8ClampedArray>) => {
    try {
      const model = await getSession();
      report('Separando o objeto do fundo…');
      const input = new ort.Tensor('float32', normalizeAiInput(data), [1, 3, AI_INPUT_SIZE, AI_INPUT_SIZE]);
      try {
        const outputs = await model.run({ [model.inputNames[0]]: input });
        try {
          const output = outputs[model.outputNames[0]];
          if (!(output.data instanceof Float32Array) || output.data.length !== AI_INPUT_SIZE ** 2) {
            throw new Error('O modelo retornou uma máscara inválida.');
          }
          const mask = logitsToMask(output.data);
          postMessage({ type: 'result', mask } satisfies AiWorkerResponse, { transfer: [mask.buffer] });
        } finally {
          for (const output of Object.values(outputs)) output.dispose();
        }
      } finally {
        input.dispose();
      }
    } catch (error) {
      console.error('Falha no recorte com IA:', error);
      try {
        await session?.release();
      } catch {
        // Ainda precisamos notificar a interface se a liberação do backend falhar.
      }
      session = null;
      postMessage({
        type: 'error',
        retryWithCpu: backend === 'webgpu',
        message:
          'Não foi possível concluir o recorte com IA. Verifique a conexão ou tente novamente. Você também pode usar o modo por cor.',
      } satisfies AiWorkerResponse);
    }
  });
}
