import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarcodeGenerator } from './barcode-generator';

describe('BarcodeGenerator', () => {
  let component: BarcodeGenerator;
  let fixture: ComponentFixture<BarcodeGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarcodeGenerator],
    }).compileComponents();

    fixture = TestBed.createComponent(BarcodeGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to the GS1-128 format', () => {
    expect(component.bcid()).toBe('gs1-128');
  });

  it('shows an error when generating without data', () => {
    component.text.set('');
    component.generate();
    expect(component.previewDataUrl()).toBeNull();
    expect(component.errorMessage()).toBe('Informe os dados a serem codificados.');
  });

  it('generates a PNG preview for a valid GS1-128 payload', () => {
    component.text.set('(01)07891234567895(17)260101(10)LOTE123');
    component.generate();
    expect(component.previewDataUrl()).toMatch(/^data:image\/png;base64,/);
    expect(component.errorMessage()).toBeNull();
  });

  it('generates a preview for a plain Code 128 value', () => {
    component.bcid.set('code128');
    component.text.set('ABC-12345');
    component.generate();
    expect(component.previewDataUrl()).toMatch(/^data:image\/png;base64,/);
    expect(component.errorMessage()).toBeNull();
  });

  it('reports a friendly error for invalid data in the selected format', () => {
    component.bcid.set('ean13');
    component.text.set('abc');
    component.generate();
    expect(component.previewDataUrl()).toBeNull();
    expect(component.errorMessage()).toBeTruthy();
  });

  it('generates one barcode per non-empty line in batch mode', () => {
    component.bcid.set('code128');
    component.batchText.set('ABC123\nDEF456\n\n');
    component.generateBatch();
    expect(component.batchItems().length).toBe(2);
    expect(component.batchItems().every((item) => item.dataUrl !== null)).toBeTrue();
  });
});
