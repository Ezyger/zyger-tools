import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrcodeGenerator } from './qrcode-generator';

describe('QrcodeGenerator', () => {
  let component: QrcodeGenerator;
  let fixture: ComponentFixture<QrcodeGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrcodeGenerator],
    }).compileComponents();

    fixture = TestBed.createComponent(QrcodeGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows an error when generating without text', () => {
    component.text.set('');
    component.generate();
    expect(component.previewDataUrl()).toBeNull();
    expect(component.errorMessage()).toBe('Informe um texto ou URL para gerar o QR Code.');
  });

  it('generates a PNG preview for valid text', () => {
    component.text.set('https://zyger.tools');
    component.generate();
    expect(component.previewDataUrl()).toMatch(/^data:image\/png;base64,/);
    expect(component.errorMessage()).toBeNull();
  });

  it('shows an error when generating a batch without values', () => {
    component.batchText.set('   ');
    component.generateBatch();
    expect(component.batchItems()).toEqual([]);
    expect(component.errorMessage()).toBe('Informe ao menos um valor, um por linha, para gerar o lote.');
  });

  it('generates one QR Code per non-empty line in batch mode', () => {
    component.batchText.set('https://a.com\nhttps://b.com\n\n');
    component.generateBatch();
    expect(component.batchItems().length).toBe(2);
    expect(component.batchItems().every((item) => item.dataUrl !== null)).toBeTrue();
  });

  it('clears single-mode state', () => {
    component.text.set('abc');
    component.generate();
    component.clear();
    expect(component.text()).toBe('');
    expect(component.previewDataUrl()).toBeNull();
  });

  for (const batch of [false, true]) {
    it(`increases both image and preview dimensions for each size in ${batch ? 'batch' : 'single'} mode`, async () => {
      component.setBatchMode(batch);
      if (batch) {
        component.batchText.set('SHEI100019223tx\nARQT120684576tx');
        component.generateBatch();
      } else {
        component.text.set('SHEI100019223tx');
        component.generate();
      }
      const select = document.createElement('select');
      let previousNaturalWidth = 0;
      let previousPreviewWidth = 0;
      for (const size of component.sizes) {
        select.replaceChildren(new Option(size.label, String(size.value)));
        component.onScaleChange({ target: select } as unknown as Event);
        fixture.detectChanges();
        const images: HTMLImageElement[] = Array.from(
          fixture.nativeElement.querySelectorAll(batch ? '.thumb' : '.preview-image'),
        );
        await Promise.all(images.map((image) => image.decode()));
        expect(images.length).toBe(batch ? 2 : 1);
        const image = images[0];
        expect(image.naturalWidth).toBeGreaterThan(previousNaturalWidth);
        expect(image.getBoundingClientRect().width).toBeGreaterThan(previousPreviewWidth);
        previousNaturalWidth = image.naturalWidth;
        previousPreviewWidth = image.getBoundingClientRect().width;
      }
    });
  }
});
