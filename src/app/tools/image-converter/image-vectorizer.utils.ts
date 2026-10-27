import tracer from 'imagetracerjs';
import { MAX_VECTOR_PIXELS, VECTOR_COLORS, VectorRequest } from './image-vectorizer.model';

/**
 * Transforma os contornos dos pixels em paths, sem incluir imagens raster no SVG.
 */
export function vectorizeImage({ image, settings }: VectorRequest): string {
  if (
    image.width <= 0 ||
    image.height <= 0 ||
    image.width * image.height > MAX_VECTOR_PIXELS ||
    image.data.length !== image.width * image.height * 4
  ) {
    throw new Error('A vetorização suporta até 4 megapixels, sem reduzir a imagem automaticamente.');
  }
  if (!VECTOR_COLORS.includes(settings.colors) || !['fine', 'balanced', 'smooth'].includes(settings.detail)) {
    throw new Error('Escolha ajustes de vetorização válidos.');
  }
  const pixels = new Uint8ClampedArray(image.data);
  // Cores invisíveis não devem consumir a paleta nem criar contornos.
  for (let offset = 0; offset < pixels.length; offset += 4) {
    if (pixels[offset + 3] === 0) pixels.fill(0, offset, offset + 3);
  }
  const colors = new Map<number, { r: number; g: number; b: number; a: number }>();
  for (let offset = 0; offset < pixels.length && colors.size <= settings.colors; offset += 4) {
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const a = pixels[offset + 3];
    const key = (r << 24) | (g << 16) | (b << 8) | a;
    if (!colors.has(key)) colors.set(key, { r, g, b, a });
  }
  const detail = {
    fine: { ltres: 0.25, qtres: 0.25, pathomit: 0 },
    balanced: { ltres: 1, qtres: 1, pathomit: 2 },
    smooth: { ltres: 2, qtres: 2, pathomit: 8 },
  }[settings.detail];
  const svg = tracer.imagedataToSVG(
    { width: image.width, height: image.height, data: pixels },
    {
      ...detail,
      colorsampling: 2,
      numberofcolors: settings.colors,
      mincolorratio: 0,
      colorquantcycles: 3,
      rightangleenhance: true,
      strokewidth: 0,
      roundcoords: 3,
      viewbox: true,
      desc: false,
      blurradius: 0,
      ...(colors.size <= settings.colors ? { pal: Array.from(colors.values()) } : {}),
    },
  );
  // O viewBox garante escala vetorial; dimensões explícitas mantêm o tamanho de importação.
  return svg.replace('<svg ', `<svg width="${image.width}" height="${image.height}" `);
}
