import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundRemover } from './background-remover';
import { BackgroundRemoverAi } from './background-remover-ai.service';

describe('BackgroundRemover', () => {
  let fixture: ComponentFixture<BackgroundRemover>;
  let component: BackgroundRemover;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [BackgroundRemover] }).compileComponents();
    fixture = TestBed.createComponent(BackgroundRemover);
    component = fixture.componentInstance;
    component.mode.set('color');
    fixture.detectChanges();
  });

  it('releases preview URLs when clearing', () => {
    spyOn(URL, 'revokeObjectURL');
    component.originalUrl.set('blob:original');
    component.resultUrl.set('blob:result');
    component.clear();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:original');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:result');
    expect(component.originalUrl()).toBeNull();
    expect(component.resultUrl()).toBeNull();
    expect(component.isProcessing()).toBeFalse();
  });

  it('uses the selected extension without changing the base name', () => {
    component.fileName.set('minha.logo.svg');
    component.outputFormat.set('webp');
    expect(component.downloadName()).toBe('minha.logo-sem-fundo.webp');
  });

  it('invalidates a result after a background adjustment', () => {
    spyOn(URL, 'revokeObjectURL');
    component.resultUrl.set('blob:result');
    const input = document.createElement('input');
    input.value = '42';
    component.onToleranceChange({ target: input } as unknown as Event);
    expect(component.tolerance()).toBe(42);
    expect(component.resultUrl()).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:result');
  });

  it('ignores an encoder failure from an export cleared while pending', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [new File([blob!], 'logo.png', { type: 'image/png' })] });
    await component.onFileInputChange({ target: input } as unknown as Event);
    await component.remove();
    expect(component.resultUrl()).not.toBeNull();

    let finishExport!: BlobCallback;
    spyOn(HTMLCanvasElement.prototype, 'toBlob').and.callFake((callback) => {
      finishExport = callback;
    });
    const select = document.createElement('select');
    select.add(new Option('WebP', 'webp'));
    const pending = component.onFormatChange({ target: select } as unknown as Event);
    component.clear();
    finishExport(new Blob([], { type: 'image/png' }));
    await pending;
    expect(component.errorMessage()).toBeNull();
    expect(component.resultUrl()).toBeNull();
    expect(component.isProcessing()).toBeFalse();
  });

  it('uses the AI result and keeps the original dimensions', async () => {
    const ai = fixture.debugElement.injector.get(BackgroundRemoverAi);
    spyOn(ai, 'remove').and.callFake(async (source, progress) => {
      progress('Recortando…');
      return new Uint8ClampedArray(source.data.length);
    });
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 3;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve));
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [new File([blob!], 'logo.png', { type: 'image/png' })] });
    await component.onFileInputChange({ target: input } as unknown as Event);
    component.mode.set('ai');
    await component.remove();
    expect(ai.remove).toHaveBeenCalled();
    const image = new Image();
    image.src = component.resultUrl()!;
    await image.decode();
    expect(image.naturalWidth).toBe(4);
    expect(image.naturalHeight).toBe(3);
    expect(component.isProcessing()).toBeFalse();
    expect(component.progress()).toBe('');
  });
});
