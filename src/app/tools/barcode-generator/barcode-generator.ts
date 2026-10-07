import { Component, computed, signal } from '@angular/core';
import {
  downloadDataUrl,
  downloadPngBatchAsZip,
  downloadTextAsFile,
  MAX_BATCH_ITEMS,
  parseBatchLines,
  renderToPngDataUrl,
  renderToSvg,
  sanitizeFileNamePart,
  toFriendlyError,
} from '../../shared/code-image.util';
import {
  BARCODE_FORMATS,
  BARCODE_SIZES,
  buildBarcodeOptions,
  DEFAULT_BARCODE_FORMAT,
  getBarcodeFormat,
} from './barcode-generator.utils';

interface BatchBarcodeItem {
  value: string;
  dataUrl: string | null;
  error: string | null;
}

@Component({
  selector: 'app-barcode-generator',
  imports: [],
  templateUrl: './barcode-generator.html',
  styleUrl: './barcode-generator.scss',
})
export class BarcodeGenerator {
  public readonly formats = BARCODE_FORMATS;
  public readonly sizes = BARCODE_SIZES;

  public readonly isBatchMode = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly bcid = signal(DEFAULT_BARCODE_FORMAT);
  public readonly text = signal('');
  public readonly scale = signal(BARCODE_SIZES[1].value);
  public readonly includeText = signal(true);
  public readonly previewDataUrl = signal<string | null>(null);

  public readonly batchText = signal('');
  public readonly batchItems = signal<BatchBarcodeItem[]>([]);

  public readonly selectedFormat = computed(() => getBarcodeFormat(this.bcid()));

  /**
   * Alterna entre a geração de um único código e a geração em lote.
   * @param enabled Indica se o modo de geração em lote deve ser ativado ou desativado.
   */
  public setBatchMode(enabled: boolean): void {
    this.isBatchMode.set(enabled);
    this.errorMessage.set(null);
  }

  /**
   * Atualiza o formato de código de barras selecionado.
   * @param event Evento disparado quando o formato é alterado.
   */
  public onFormatChange(event: Event): void {
    this.bcid.set((event.target as HTMLSelectElement).value);
  }

  /**
   * Atualiza o texto/dados que serão codificados.
   * @param event Evento disparado quando o texto é alterado.
   */
  public onTextChange(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Atualiza o tamanho selecionado para o código gerado.
   * @param event Evento disparado quando o tamanho é alterado.
   */
  public onScaleChange(event: Event): void {
    this.scale.set(Number((event.target as HTMLSelectElement).value));
  }

  /**
   * Alterna a exibição do texto legível abaixo do código de barras.
   * @param event Evento disparado quando a opção de exibir o texto é alterada.
   */
  public onIncludeTextChange(event: Event): void {
    this.includeText.set((event.target as HTMLInputElement).checked);
  }

  /**
   * Gera a pré-visualização do código de barras a partir dos dados informados.
   * @throws Lança um erro caso a geração do código de barras falhe.
   */
  public generate(): void {
    const value = this.text().trim();
    if (!value) {
      this.errorMessage.set('Informe os dados a serem codificados.');
      this.previewDataUrl.set(null);
      return;
    }
    try {
      const dataUrl = renderToPngDataUrl(buildBarcodeOptions(this.bcid(), value, this.scale(), this.includeText()));
      this.previewDataUrl.set(dataUrl);
      this.errorMessage.set(null);
    } catch (error) {
      this.previewDataUrl.set(null);
      this.errorMessage.set(toFriendlyError(error));
    }
  }

  /**
   * Baixa o código gerado como imagem PNG.
   * @throws Lança um erro caso o download falhe.
   */
  public downloadPng(): void {
    const dataUrl = this.previewDataUrl();
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, `${this.bcid()}-${sanitizeFileNamePart(this.text())}.png`);
  }

  /**
   * Baixa o código gerado como arquivo SVG vetorial.
   * @throws Lança um erro caso o download falhe.
   */
  public downloadSvg(): void {
    const value = this.text().trim();
    if (!value) return;
    try {
      const svg = renderToSvg(buildBarcodeOptions(this.bcid(), value, this.scale(), this.includeText()));
      downloadTextAsFile(svg, `${this.bcid()}-${sanitizeFileNamePart(value)}.svg`, 'image/svg+xml');
    } catch (error) {
      this.errorMessage.set(toFriendlyError(error));
    }
  }

  /**
   * Limpa o modo de geração única.
   */
  public clear(): void {
    this.text.set('');
    this.previewDataUrl.set(null);
    this.errorMessage.set(null);
  }

  /**
   * Atualiza o texto em lote (um valor por linha).
   * @param event Evento disparado quando o texto em lote é alterado.
   */
  public onBatchTextChange(event: Event): void {
    this.batchText.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Gera um código de barras para cada linha informada no lote, usando o formato selecionado.
   * @throws Lança um erro caso a geração de algum código de barras falhe.
   */
  public generateBatch(): void {
    const lines = parseBatchLines(this.batchText());
    if (lines.length === 0) {
      this.errorMessage.set('Informe ao menos um valor, um por linha, para gerar o lote.');
      this.batchItems.set([]);
      return;
    }
    if (lines.length > MAX_BATCH_ITEMS) {
      this.errorMessage.set(`O lote suporta no máximo ${MAX_BATCH_ITEMS} códigos por vez.`);
      this.batchItems.set([]);
      return;
    }
    this.errorMessage.set(null);
    const items: BatchBarcodeItem[] = lines.map((value) => {
      try {
        const dataUrl = renderToPngDataUrl(buildBarcodeOptions(this.bcid(), value, this.scale(), this.includeText()));
        return { value, dataUrl, error: null };
      } catch (error) {
        return { value, dataUrl: null, error: toFriendlyError(error) };
      }
    });
    this.batchItems.set(items);
  }

  /**
   * Baixa todos os códigos gerados com sucesso no lote como um único arquivo .zip.
   * @throws Lança um erro caso o download do arquivo .zip falhe.
   */
  public async downloadBatchZip(): Promise<void> {
    const items = this.batchItems()
      .filter((item): item is BatchBarcodeItem & { dataUrl: string } => item.dataUrl !== null)
      .map((item, index) => ({
        fileName: `${index + 1}-${sanitizeFileNamePart(item.value)}.png`,
        dataUrl: item.dataUrl,
      }));
    if (items.length === 0) return;
    await downloadPngBatchAsZip(items, `${this.bcid()}.zip`);
  }

  /**
   * Limpa os dados do modo de geração em lote.
   */
  public clearBatch(): void {
    this.batchText.set('');
    this.batchItems.set([]);
    this.errorMessage.set(null);
  }
}
