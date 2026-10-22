import { exportBackgroundImage } from './background-remover-export.utils';

describe('exportBackgroundImage', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 2;
  });

  it('preserves transparency in PNG and WebP', async () => {
    for (const format of ['png', 'webp'] as const) {
      const blob = await exportBackgroundImage(canvas, format);
      expect(blob.type).toBe(`image/${format}`);
      const bitmap = await createImageBitmap(blob);
      try {
        const context = canvas.getContext('2d')!;
        context.drawImage(bitmap, 0, 0);
        expect(context.getImageData(0, 0, 1, 1).data[3]).toBe(0);
      } finally {
        bitmap.close();
      }
    }
  });

  it('fills JPEG transparency with white without changing the source', async () => {
    const blob = await exportBackgroundImage(canvas, 'jpeg');
    expect(blob.type).toBe('image/jpeg');
    expect(canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data[3]).toBe(0);
    const bitmap = await createImageBitmap(blob);
    try {
      const context = canvas.getContext('2d')!;
      context.drawImage(bitmap, 0, 0);
      expect(Array.from(context.getImageData(0, 0, 1, 1).data)).toEqual([255, 255, 255, 255]);
    } finally {
      bitmap.close();
    }
  });

  it('embeds a PNG with the original dimensions in a valid SVG', async () => {
    const blob = await exportBackgroundImage(canvas, 'svg');
    expect(blob.type).toBe('image/svg+xml');
    const svg = new DOMParser().parseFromString(await blob.text(), 'image/svg+xml');
    expect(svg.querySelector('parsererror')).toBeNull();
    expect(svg.documentElement.getAttribute('viewBox')).toBe('0 0 2 2');
    expect(svg.querySelector('image')?.getAttribute('href')).toMatch(/^data:image\/png;base64,/);
  });

  it('rejects silent browser fallback to PNG', async () => {
    spyOn(canvas, 'toBlob').and.callFake((callback) => callback(new Blob([], { type: 'image/png' })));
    await expectAsync(exportBackgroundImage(canvas, 'webp')).toBeRejectedWithError(/não permite exportar/);
  });

  it('reports a failed encoder', async () => {
    spyOn(canvas, 'toBlob').and.callFake((callback) => callback(null));
    await expectAsync(exportBackgroundImage(canvas, 'png')).toBeRejectedWithError(/Não foi possível exportar/);
  });
});
