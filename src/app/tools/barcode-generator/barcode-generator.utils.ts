import { CodeImageOptions } from '../../shared/code-image.util';

export interface BarcodeFormatOption {
  bcid: string;
  label: string;
  placeholder: string;
  hint: string;
}

/**
 * Lista de formatos de código de barras suportados pela ferramenta. 
 */
export const BARCODE_FORMATS: BarcodeFormatOption[] = [
  {
    bcid: 'gs1-128',
    label: 'GS1-128',
    placeholder: '(01)07891234567895(17)260101(10)LOTE123',
    hint: 'Use parênteses para delimitar cada AI (Identificador de Aplicação) do GS1, ex.: (01)...(17)...',
  },
  {
    bcid: 'code128',
    label: 'Code 128',
    placeholder: 'ABC-12345',
    hint: 'Aceita letras, números e a maioria dos símbolos ASCII.',
  },
  {
    bcid: 'ean13',
    label: 'EAN-13',
    placeholder: '789123456789',
    hint: '12 ou 13 dígitos numéricos (o dígito verificador pode ser calculado automaticamente).',
  },
  {
    bcid: 'ean8',
    label: 'EAN-8',
    placeholder: '1234567',
    hint: '7 ou 8 dígitos numéricos.',
  },
  {
    bcid: 'upca',
    label: 'UPC-A',
    placeholder: '03600029145',
    hint: '11 ou 12 dígitos numéricos.',
  },
  {
    bcid: 'code39',
    label: 'Code 39',
    placeholder: 'CODE39',
    hint: 'Letras maiúsculas, números e os símbolos - . $ / + % espaço.',
  },
  {
    bcid: 'code93',
    label: 'Code 93',
    placeholder: 'CODE93',
    hint: 'Letras maiúsculas, números e símbolos básicos.',
  },
  {
    bcid: 'interleaved2of5',
    label: 'ITF (Interleaved 2 of 5)',
    placeholder: '1234567890',
    hint: 'Somente números, em quantidade par de dígitos.',
  },
  {
    bcid: 'rationalizedCodabar',
    label: 'Codabar',
    placeholder: 'A1234567890A',
    hint: 'Números e os símbolos - $ : / . +, iniciando e terminando com uma letra de A a D.',
  },
  {
    bcid: 'pdf417',
    label: 'PDF417',
    placeholder: 'Texto ou dados do PDF417',
    hint: 'Aceita texto livre, ideal para armazenar grandes volumes de dados.',
  },
  {
    bcid: 'datamatrix',
    label: 'Data Matrix',
    placeholder: 'Texto do Data Matrix',
    hint: 'Aceita texto livre, ideal para códigos pequenos.',
  },
];

export const DEFAULT_BARCODE_FORMAT = BARCODE_FORMATS[0].bcid;

/**
 * Opções de tamanho disponíveis para os códigos de barras.
 */
export interface BarcodeSizeOption {
  value: number;
  label: string;
}

/**
 * Lista de tamanhos de código de barras disponíveis.
 */
export const BARCODE_SIZES: BarcodeSizeOption[] = [
  { value: 2, label: 'Pequeno' },
  { value: 3, label: 'Médio' },
  { value: 5, label: 'Grande' },
];

/** 
 * Busca a configuração de um formato de código de barras pelo seu identificador (bcid).
 * @param bcid O identificador do formato de código de barras.
 * @returns A configuração correspondente ao bcid informado, ou a primeira configuração padrão se não encontrada.
 */
export function getBarcodeFormat(bcid: string): BarcodeFormatOption {
  return BARCODE_FORMATS.find((format) => format.bcid === bcid) ?? BARCODE_FORMATS[0];
}

/** 
 * Monta as opções do bwip-js para gerar um código de barras a partir do formato e texto informados.
 * @param bcid O identificador do formato de código de barras.
 * @param text O texto a ser codificado no código de barras.
 * @param scale O fator de escala para o tamanho do código de barras.
 * @param includeText Indica se o texto deve ser incluído abaixo do código de barras.
 * @returns As opções configuradas para o bwip-js.
 */
export function buildBarcodeOptions(bcid: string, text: string, scale: number, includeText: boolean): CodeImageOptions {
  return {
    bcid,
    text,
    scale,
    includetext: includeText,
    textxalign: 'center',
  };
}
