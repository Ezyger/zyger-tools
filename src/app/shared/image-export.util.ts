export const IMAGE_OUTPUT_FORMATS = [
  { value: 'png', label: 'PNG — transparente', mime: 'image/png' },
  { value: 'webp', label: 'WebP — transparente', mime: 'image/webp' },
  { value: 'jpeg', label: 'JPEG — fundo branco', mime: 'image/jpeg' },
  { value: 'svg', label: 'SVG — imagem incorporada', mime: 'image/svg+xml' },
] as const;

export type ImageOutputFormat = (typeof IMAGE_OUTPUT_FORMATS)[number]['value'];

/**
 * Exporta a imagem em qualidade máxima, preservando o canvas transparente para futuras conversões.
 * @param source O canvas de origem a ser exportado.
 * @param outputFormat O formato de saída desejado.
 * @returns Uma Promise que resolve para um Blob contendo a imagem exportada.
 * @throws Erro se o formato de saída não for válido ou se a exportação falhar.
 */
export async function exportCanvasImage(source: HTMLCanvasElement, outputFormat: ImageOutputFormat): Promise<Blob> {
  const format = IMAGE_OUTPUT_FORMATS.find((item) => item.value === outputFormat);
  if (!format) throw new Error('Escolha um formato de saída válido.');

  if (format.value === 'svg') {
    return new Blob(
      [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${source.width}" height="${source.height}" viewBox="0 0 ${source.width} ${source.height}">` +
          `<image width="${source.width}" height="${source.height}" href="${source.toDataURL('image/png')}"/></svg>`,
      ],
      { type: format.mime },
    );
  }

  let canvas = source;
  if (format.value === 'jpeg') {
    canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a imagem para exportação.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0);
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format.mime, 1));
  if (!blob) throw new Error('Não foi possível exportar a imagem. Tente uma imagem menor.');
  if (blob.type !== format.mime) {
    throw new Error('Seu navegador não permite exportar neste formato. Escolha PNG ou outro formato disponível.');
  }
  return blob;
}
