import bwipjs from '@bwip-js/browser';
import JSZip from 'jszip';

/**
 * Opções aceitas pelo bwip-js para renderizar um QR Code ou código de barras.
 */
export interface CodeImageOptions {
  bcid: string;
  text: string;
  scale?: number;
  includetext?: boolean;
  textxalign?: 'offleft' | 'left' | 'center' | 'right' | 'offright' | 'justify';
  eclevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Item de imagem individual para inclusão em um lote (arquivo .zip).
 */
export interface BatchImageItem {
  fileName: string;
  dataUrl: string;
}

export const MAX_BATCH_ITEMS = 300;

/**
 * Renderiza um código como PNG em um canvas isolado e retorna a imagem como data URL.
 * @param options Opções de configuração para gerar a imagem do código.
 * @returns Data URL da imagem PNG gerada.
 */
export function renderToPngDataUrl(options: CodeImageOptions): string {
  const canvas = document.createElement('canvas');
  bwipjs.toCanvas(canvas, options);
  return canvas.toDataURL('image/png');
}

/**
 * Renderiza um código como SVG, retornando o marcador XML pronto para download.
 * @param options Opções de configuração para gerar a imagem do código.
 * @returns Marcador XML do SVG gerado.
 */
export function renderToSvg(options: CodeImageOptions): string {
  return bwipjs.toSVG(options);
}

/**
 * Converte um erro lançado pelo bwip-js (string ou Error) em uma mensagem amigável.
 * @param error Erro a ser convertido em mensagem amigável.
 * @returns Mensagem de erro amigável.
 */
export function toFriendlyError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Não foi possível gerar o código com os dados informados.';
}

/**
 * Separa um texto em lote em uma lista de valores, uma linha por código, ignorando linhas em branco.
 * @param text Texto em lote contendo múltiplas linhas.
 * @returns Lista de valores extraídos do texto em lote.
 */
export function parseBatchLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Gera um nome de arquivo seguro a partir de um valor arbitrário de texto.
 * @param value Valor de texto a ser convertido em parte de nome de arquivo.
 * @returns Parte de nome de arquivo sanitizada e segura.
 */
export function sanitizeFileNamePart(value: string): string {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60);
  return sanitized || 'codigo';
}

/**
 * Baixa uma data URL (ex.: PNG gerado em canvas) diretamente como arquivo.
 * @param dataUrl Data URL da imagem a ser baixada.
 * @param fileName Nome do arquivo a ser salvo.
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

/**
 * Baixa um conteúdo textual (ex.: SVG) como arquivo.
 * @param content Conteúdo textual a ser baixado.
 * @param fileName Nome do arquivo a ser salvo.
 * @param mimeType Tipo MIME do conteúdo (ex.: 'image/svg+xml').
 */
export function downloadTextAsFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Compacta uma lista de imagens PNG (data URL) em um único arquivo .zip para download.
 * @param items Lista de itens de imagem a serem incluídos no arquivo .zip.
 * @param zipFileName Nome do arquivo .zip a ser salvo.
 * @returns Promessa que resolve quando o download estiver concluído.
 */
export async function downloadPngBatchAsZip(items: BatchImageItem[], zipFileName: string): Promise<void> {
  const zip = new JSZip();
  for (const item of items) {
    const base64 = item.dataUrl.split(',')[1];
    zip.file(item.fileName, base64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = zipFileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
