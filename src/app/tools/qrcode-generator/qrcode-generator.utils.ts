import { CodeImageOptions } from '../../shared/code-image.util';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrErrorCorrectionOption {
  value: QrErrorCorrection;
  label: string;
}

/**
 * Níveis de correção de erros disponíveis para o QR Code.
 */
export const QR_ERROR_CORRECTION_LEVELS: QrErrorCorrectionOption[] = [
  { value: 'L', label: 'Baixa (L) · recupera ~7%' },
  { value: 'M', label: 'Média (M) · recupera ~15%' },
  { value: 'Q', label: 'Alta (Q) · recupera ~25%' },
  { value: 'H', label: 'Máxima (H) · recupera ~30%' },
];

/**
 * Interface que define uma opção de tamanho para o QR Code.
 */
export interface QrSizeOption {
  value: number;
  label: string;
}

/**
 * Opções de tamanho disponíveis para o QR Code.
 */
export const QR_SIZES: QrSizeOption[] = [
  { value: 4, label: 'Pequeno' },
  { value: 7, label: 'Médio' },
  { value: 10, label: 'Grande' },
];

/**
 * Monta as opções do bwip-js para gerar um QR Code a partir de um texto.
 * @param text Texto a ser codificado no QR Code.
 * @param eclevel Nível de correção de erros do QR Code.
 * @param scale Escala do QR Code gerado.
 * @returns Opções configuradas para a geração do QR Code.
 */
export function buildQrCodeOptions(text: string, eclevel: QrErrorCorrection, scale: number): CodeImageOptions {
  return {
    bcid: 'qrcode',
    text,
    eclevel,
    scale,
  };
}
