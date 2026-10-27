import { BackgroundRemoverAi } from './background-remover-ai.service';
import { AI_INPUT_SIZE } from './background-remover-ai.utils';

describe('BackgroundRemoverAi', () => {
  let service: BackgroundRemoverAi;
  let worker: Worker;
  let originalGpu: PropertyDescriptor | undefined;
  let createWorker: jasmine.Spy;

  beforeEach(() => {
    originalGpu = Object.getOwnPropertyDescriptor(navigator, 'gpu');
    Object.defineProperty(navigator, 'gpu', { configurable: true, value: {} });
    worker = {
      onmessage: null,
      onerror: null,
      postMessage: jasmine.createSpy('postMessage'),
      terminate: jasmine.createSpy('terminate'),
    } as unknown as Worker;
    createWorker = spyOn(globalThis, 'Worker').and.returnValue(worker);
    service = new BackgroundRemoverAi();
  });

  afterEach(() => {
    service.ngOnDestroy();
    if (originalGpu) Object.defineProperty(navigator, 'gpu', originalGpu);
    else Reflect.deleteProperty(navigator, 'gpu');
  });

  function fallbackWorker(): Worker {
    const cpu = {
      onmessage: null,
      onerror: null,
      postMessage: jasmine.createSpy('cpuPostMessage'),
      terminate: jasmine.createSpy('cpuTerminate'),
    } as unknown as Worker;
    createWorker.and.returnValues(worker, cpu);
    return cpu;
  }

  it('recovers from GPU initialization failure in a separate CPU worker with intact input', async () => {
    const cpu = fallbackWorker();
    let firstInput: Uint8ClampedArray | undefined;
    (worker.postMessage as jasmine.Spy).and.callFake((input: Uint8ClampedArray) => {
      firstInput = structuredClone(input, { transfer: [input.buffer] });
    });
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    worker.onmessage?.call(
      worker,
      new MessageEvent('message', {
        data: { type: 'error', retryWithCpu: true, message: 'initWasm failed' },
      }),
    );
    expect(worker.terminate).toHaveBeenCalled();
    expect(globalThis.Worker).toHaveBeenCalledTimes(2);
    const secondInput = (cpu.postMessage as jasmine.Spy).calls.mostRecent().args[0];
    expect(Array.from(secondInput)).toEqual(Array.from(firstInput!));
    cpu.onmessage?.call(
      cpu,
      new MessageEvent('message', {
        data: { type: 'result', mask: new Uint8ClampedArray(AI_INPUT_SIZE ** 2).fill(255) },
      }),
    );
    expect((await pending).length).toBe(16);
  });

  it('recovers from a GPU worker module loading error', async () => {
    const cpu = fallbackWorker();
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    worker.onerror?.call(worker, new ErrorEvent('error'));
    cpu.onmessage?.call(
      cpu,
      new MessageEvent('message', {
        data: { type: 'result', mask: new Uint8ClampedArray(AI_INPUT_SIZE ** 2).fill(255) },
      }),
    );
    await expectAsync(pending).toBeResolved();
    expect(globalThis.Worker).toHaveBeenCalledTimes(2);
  });

  it('does not retry indefinitely if the CPU backend also fails', async () => {
    const cpu = fallbackWorker();
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    worker.onmessage?.call(
      worker,
      new MessageEvent('message', {
        data: { type: 'error', retryWithCpu: true, message: 'GPU failed' },
      }),
    );
    cpu.onmessage?.call(
      cpu,
      new MessageEvent('message', {
        data: { type: 'error', retryWithCpu: true, message: 'CPU failed' },
      }),
    );
    await expectAsync(pending).toBeRejectedWithError('CPU failed');
    expect(globalThis.Worker).toHaveBeenCalledTimes(2);
    expect(cpu.terminate).toHaveBeenCalled();
  });

  it('cancels processing during CPU recovery', async () => {
    const cpu = fallbackWorker();
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    worker.onerror?.call(worker, new ErrorEvent('error'));
    service.cancel();
    await expectAsync(pending).toBeRejectedWithError(/cancelado/);
    expect(cpu.terminate).toHaveBeenCalled();
  });

  it('rejects cleanly if a replacement worker cannot be constructed', async () => {
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    createWorker.and.throwError('Worker blocked');
    worker.onerror?.call(worker, new ErrorEvent('error'));
    await expectAsync(pending).toBeRejectedWithError('Worker blocked');
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('resizes the mask to the original image while retaining original transparency', async () => {
    const source = new ImageData(new Uint8ClampedArray([10, 20, 30, 128, 40, 50, 60, 0]), 2, 1);
    const progress = jasmine.createSpy('progress');
    const pending = service.remove(source, progress);
    worker.onmessage?.call(worker, new MessageEvent('message', { data: { type: 'progress', message: 'Recortando' } }));
    worker.onmessage?.call(
      worker,
      new MessageEvent('message', {
        data: { type: 'result', mask: new Uint8ClampedArray(AI_INPUT_SIZE ** 2).fill(128) },
      }),
    );
    const result = await pending;
    expect(Array.from(result)).toEqual([10, 20, 30, 64, 40, 50, 60, 0]);
    expect(progress).toHaveBeenCalledWith('Recortando');
    expect(worker.postMessage).toHaveBeenCalled();
  });

  it('terminates pending work when cancelled', async () => {
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    service.cancel();
    await expectAsync(pending).toBeRejectedWithError(/cancelado/);
    expect(worker.terminate).toHaveBeenCalled();
    expect(worker.onmessage).toBeNull();
  });

  it('rejects an invalid mask', async () => {
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    worker.onmessage?.call(
      worker,
      new MessageEvent('message', {
        data: { type: 'result', mask: new Uint8ClampedArray(0) },
      }),
    );
    await expectAsync(pending).toBeRejectedWithError(/recorte inválido/);
  });

  it('releases a worker that cannot accept input', async () => {
    (worker.postMessage as jasmine.Spy).and.throwError('Worker unavailable');
    await expectAsync(service.remove(new ImageData(2, 2), () => undefined)).toBeRejectedWithError(/iniciar o recorte/);
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('restarts the runtime after a reported initialization failure', async () => {
    const pending = service.remove(new ImageData(2, 2), () => undefined);
    worker.onmessage?.call(
      worker,
      new MessageEvent('message', {
        data: { type: 'error', message: 'Falha no modelo' },
      }),
    );
    await expectAsync(pending).toBeRejectedWithError('Falha no modelo');
    expect(worker.terminate).toHaveBeenCalled();
    const retry = service.remove(new ImageData(2, 2), () => undefined);
    expect(globalThis.Worker).toHaveBeenCalledTimes(2);
    service.cancel();
    await expectAsync(retry).toBeRejectedWithError(/cancelado/);
  });
});
