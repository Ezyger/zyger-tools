import { buildQrCodeOptions, QrErrorCorrection } from './qrcode-generator.utils';

describe('buildQrCodeOptions', () => {
  it('builds bwip-js options with the qrcode bcid', () => {
    expect(buildQrCodeOptions('https://zyger.tools', 'M', 6)).toEqual({
      bcid: 'qrcode',
      text: 'https://zyger.tools',
      eclevel: 'M',
      scale: 6,
    });
  });

  it('keeps the requested error correction level', () => {
    const levels: QrErrorCorrection[] = ['L', 'M', 'Q', 'H'];
    for (const level of levels) {
      expect(buildQrCodeOptions('abc', level, 4).eclevel).toBe(level);
    }
  });
});
