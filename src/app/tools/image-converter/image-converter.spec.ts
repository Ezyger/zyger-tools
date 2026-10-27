import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageConverter } from './image-converter';
import { ImageVectorizer } from './image-vectorizer.service';
import { vectorizeImage } from './image-vectorizer.utils';

describe('ImageConverter', () => {
  let fixture: ComponentFixture<ImageConverter>;
  let component: ImageConverter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ImageConverter] }).compileComponents();
    fixture = TestBed.createComponent(ImageConverter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  async function upload(blob: Blob, name: string): Promise<void> {
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [new File([blob], name, { type: blob.type })] });
    await component.onFileInputChange({ target: input } as unknown as Event);
  }

  async function png(): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = 3;
    canvas.height = 2;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#123456';
    context.fillRect(0, 0, 1, 1);
    return (await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve)))!;
  }

  async function resultImage(): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = component.resultUrl()!;
    await image.decode();
    return image;
  }

  it('preserves dimensions and PNG pixels including transparency', async () => {
    await upload(await png(), 'original.png');
    await component.convert();
    const image = await resultImage();
    expect([image.naturalWidth, image.naturalHeight]).toEqual([3, 2]);
    const canvas = document.createElement('canvas');
    canvas.width = 3;
    canvas.height = 2;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    expect(Array.from(context.getImageData(0, 0, 1, 1).data)).toEqual([18, 52, 86, 255]);
    expect(context.getImageData(2, 1, 1, 1).data[3]).toBe(0);
  });

  it('converts PNG into a self-contained SVG with an embedded lossless PNG', async () => {
    await upload(await png(), 'original.png');
    component.format.set('svg');
    await component.convert();
    const blob = await (await fetch(component.resultUrl()!)).blob();
    expect(blob.type).toBe('image/svg+xml');
    const document = new DOMParser().parseFromString(await blob.text(), 'image/svg+xml');
    expect(document.querySelector('parsererror')).toBeNull();
    expect(document.querySelector('image')?.getAttribute('href')).toMatch(/^data:image\/png;base64,/);
    const image = await resultImage();
    expect([image.naturalWidth, image.naturalHeight]).toEqual([3, 2]);
    expect(component.downloadName()).toBe('original-convertida.svg');
  });

  it('renders SVG at a larger resolution directly from the vector source', async () => {
    await upload(
      new Blob(
        ['<svg xmlns="http://www.w3.org/2000/svg" width="2" height="3"><rect width="2" height="3" fill="#123456"/></svg>'],
        { type: 'image/svg+xml' },
      ),
      'original.svg',
    );
    component.scale.set(4);
    await component.convert();
    const image = await resultImage();
    expect([image.naturalWidth, image.naturalHeight]).toEqual([8, 12]);
  });

  it('preserves original vector markup when saving SVG as SVG', async () => {
    const source = '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="3"><path id="vector" d="M0 0 L2 3"/></svg>';
    await upload(new Blob([source], { type: 'image/svg+xml' }), 'original.svg');
    component.format.set('svg');
    await component.convert();
    expect(await (await fetch(component.resultUrl()!)).text()).toBe(source);
  });

  it('rejects invalid images without leaving an old download available', async () => {
    await upload(await png(), 'original.png');
    await component.convert();
    await upload(new Blob(['invalid'], { type: 'image/png' }), 'broken.png');
    expect(component.originalUrl()).toBeNull();
    expect(component.resultUrl()).toBeNull();
    expect(component.errorMessage()).not.toBeNull();
    expect(component.isProcessing()).toBeFalse();
  });

  it('does not restore an export that finishes after the component is cleared', async () => {
    await upload(await png(), 'original.png');
    let finish!: BlobCallback;
    spyOn(HTMLCanvasElement.prototype, 'toBlob').and.callFake((callback) => {
      finish = callback;
    });
    const pending = component.convert();
    component.clear();
    finish(new Blob([], { type: 'image/png' }));
    await pending;
    expect(component.resultUrl()).toBeNull();
    expect(component.resultBytes()).toBeNull();
    expect(component.errorMessage()).toBeNull();
  });

  it('rejects an oversized rendering without reducing resolution silently', async () => {
    await upload(
      new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000"/>'], { type: 'image/svg+xml' }),
      'large.svg',
    );
    component.scale.set(4);
    await component.convert();
    expect(component.resultUrl()).toBeNull();
    expect(component.errorMessage()).toContain('40 megapixels');
    expect(component.outputWidth()).toBe(8000);
  });

  it('offers real vector output separately from embedded PNG output', async () => {
    const vectorizer = fixture.debugElement.injector.get(ImageVectorizer);
    spyOn(vectorizer, 'vectorize').and.callFake(async (image, settings) => vectorizeImage({ image, settings }));
    await upload(await png(), 'logo.png');
    component.format.set('svg');
    component.svgMode.set('vector');
    await component.convert();
    const svg = new DOMParser().parseFromString(await (await fetch(component.resultUrl()!)).text(), 'image/svg+xml');
    expect(svg.querySelector('image')).toBeNull();
    expect(svg.querySelector('path')).not.toBeNull();
    expect(component.downloadName()).toBe('logo-vetorizada.svg');
    expect(vectorizer.vectorize).toHaveBeenCalled();
    expect(component.isVectorizing()).toBeFalse();
  });

  it('does not restore a vector result after cancellation', async () => {
    const vectorizer = fixture.debugElement.injector.get(ImageVectorizer);
    let complete!: (svg: string) => void;
    spyOn(vectorizer, 'vectorize').and.callFake(
      () =>
        new Promise((resolve) => {
          complete = resolve;
        }),
    );
    spyOn(vectorizer, 'cancel').and.callThrough();
    await upload(await png(), 'logo.png');
    component.format.set('svg');
    component.svgMode.set('vector');
    const pending = component.convert();
    component.cancelVectorization();
    complete('<svg xmlns="http://www.w3.org/2000/svg"/>');
    await pending;
    expect(vectorizer.cancel).toHaveBeenCalled();
    expect(component.resultUrl()).toBeNull();
    expect(component.isProcessing()).toBeFalse();
    expect(component.errorMessage()).toBeNull();
  });

  it('shows the actual tracing palette size when vector controls are first rendered', async () => {
    await upload(await png(), 'logo.png');
    component.format.set('svg');
    component.svgMode.set('vector');
    fixture.detectChanges();
    const colors = fixture.nativeElement.querySelector('#vector-colors') as HTMLSelectElement;
    expect(colors.value).toBe('32');
    colors.value = '64';
    colors.dispatchEvent(new Event('change'));
    expect(component.vectorColors()).toBe(64);
  });
});
