import { ImageVectorizer } from './image-vectorizer.service';

describe('ImageVectorizer', () => {
  let service: ImageVectorizer;
  let worker: Worker;

  beforeEach(() => {
    worker = {
      onmessage: null,
      onerror: null,
      postMessage: jasmine.createSpy('postMessage'),
      terminate: jasmine.createSpy('terminate'),
    } as unknown as Worker;
    spyOn(globalThis, 'Worker').and.returnValue(worker);
    service = new ImageVectorizer();
  });

  afterEach(() => service.ngOnDestroy());

  it('returns the SVG and releases the worker after tracing', async () => {
    const pending = service.vectorize(new ImageData(2, 2), { colors: 32, detail: 'fine' });
    worker.onmessage?.call(worker, new MessageEvent('message', { data: { type: 'result', svg: '<svg/>' } }));
    expect(await pending).toBe('<svg/>');
    expect(worker.terminate).toHaveBeenCalled();
    expect(worker.onmessage).toBeNull();
  });

  it('cancels pending work and does not leave a callback that can overwrite later work', async () => {
    const pending = service.vectorize(new ImageData(2, 2), { colors: 32, detail: 'fine' });
    service.cancel();
    await expectAsync(pending).toBeRejectedWithError(/cancelada/);
    expect(worker.terminate).toHaveBeenCalled();
    expect(worker.onmessage).toBeNull();
  });

  it('reports worker failures', async () => {
    const pending = service.vectorize(new ImageData(2, 2), { colors: 32, detail: 'fine' });
    worker.onerror?.call(worker, new ErrorEvent('error'));
    await expectAsync(pending).toBeRejectedWithError(/Não foi possível vetorizar/);
    expect(worker.terminate).toHaveBeenCalled();
  });
});
