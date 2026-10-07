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
});
