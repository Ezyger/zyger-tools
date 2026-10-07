import { buildBarcodeOptions, getBarcodeFormat } from './barcode-generator.utils';

describe('getBarcodeFormat', () => {
  it('finds a known format by bcid', () => {
    expect(getBarcodeFormat('ean13').label).toBe('EAN-13');
  });

  it('falls back to the first format for an unknown bcid', () => {
    expect(getBarcodeFormat('unknown').bcid).toBe('gs1-128');
  });
});

describe('buildBarcodeOptions', () => {
  it('builds bwip-js options with the given format and text', () => {
    expect(buildBarcodeOptions('code128', 'ABC123', 3, true)).toEqual({
      bcid: 'code128',
      text: 'ABC123',
      scale: 3,
      includetext: true,
      textxalign: 'center',
    });
  });

  it('keeps the GS1-128 AI bracket format untouched', () => {
    const options = buildBarcodeOptions('gs1-128', '(01)07891234567895(17)260101', 2, false);
    expect(options.text).toBe('(01)07891234567895(17)260101');
    expect(options.includetext).toBeFalse();
  });
});
