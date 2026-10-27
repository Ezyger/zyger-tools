import { vectorizeImage } from './image-vectorizer.utils';
import { VectorRequest } from './image-vectorizer.model';

describe('vectorizeImage', () => {
  function request(): VectorRequest {
    const data = new Uint8ClampedArray(32 * 32 * 4);
    for (let y = 8; y < 24; y++) {
      for (let x = 8; x < 24; x++) data.set([255, 0, 0, 255], (y * 32 + x) * 4);
    }
    return { image: { width: 32, height: 32, data }, settings: { colors: 32, detail: 'fine' } };
  }

  it('creates editable paths with explicit dimensions and no embedded raster', () => {
    const svg = new DOMParser().parseFromString(vectorizeImage(request()), 'image/svg+xml');
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(svg.querySelector('image')).toBeNull();
    expect(svg.documentElement.getAttribute('viewBox')).toBe('0 0 32 32');
    expect(svg.documentElement.getAttribute('width')).toBe('32');
  });

  it('retains the opaque foreground and transparent background when rendered', async () => {
    const url = URL.createObjectURL(new Blob([vectorizeImage(request())], { type: 'image/svg+xml' }));
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 32;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      expect(Array.from(context.getImageData(16, 16, 1, 1).data)).toEqual([255, 0, 0, 255]);
      expect(context.getImageData(0, 0, 1, 1).data[3]).toBe(0);
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  it('preserves a transparent hole inside a shape', async () => {
    const input = request();
    for (let y = 12; y < 20; y++) {
      for (let x = 12; x < 20; x++) input.image.data.fill(0, (y * 32 + x) * 4, (y * 32 + x) * 4 + 4);
    }
    const url = URL.createObjectURL(new Blob([vectorizeImage(input)], { type: 'image/svg+xml' }));
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 32;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      expect(context.getImageData(16, 16, 1, 1).data[3]).toBe(0);
      expect(context.getImageData(10, 10, 1, 1).data[3]).toBe(255);
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  it('produces repeatable paths without changing input pixels', () => {
    const input = request();
    const pixels = new Uint8ClampedArray(input.image.data);
    const first = vectorizeImage(input);
    expect(vectorizeImage(input)).toBe(first);
    expect(input.image.data).toEqual(pixels);
  });

  it('accepts native ImageData whose dimensions are prototype getters', () => {
    const input = request();
    input.image = new ImageData(input.image.data, input.image.width, input.image.height);
    expect(vectorizeImage(input)).toContain('viewBox="0 0 32 32"');
  });

  it('rejects large images and unsupported settings instead of downsampling silently', () => {
    const large = request();
    large.image = { ...large.image, width: 3000, height: 3000 };
    expect(() => vectorizeImage(large)).toThrowError(/4 megapixels/);
    const invalid = request();
    invalid.settings.colors = 100;
    expect(() => vectorizeImage(invalid)).toThrowError(/ajustes/);
  });
});
