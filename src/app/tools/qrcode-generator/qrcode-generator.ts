import { Component, signal } from '@angular/core';
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
import { buildQrCodeOptions, QR_ERROR_CORRECTION_LEVELS, QR_SIZES, QrErrorCorrection } from './qrcode-generator.utils';

interface BatchQrItem {
  value: string;
  dataUrl: string | null;
  error: string | null;
}

@Component({
  selector: 'app-qrcode-generator',
  imports: [],
  templateUrl: './qrcode-generator.html',
  styleUrl: './qrcode-generator.scss',
})
export class QrcodeGenerator {
  public readonly errorCorrectionLevels = QR_ERROR_CORRECTION_LEVELS;
  public readonly sizes = QR_SIZES;

  public readonly isBatchMode = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  public readonly text = signal('');
  public readonly eclevel = signal<QrErrorCorrection>('M');
  public readonly scale = signal(QR_SIZES[1].value);
  public readonly previewDataUrl = signal<string | null>(null);

  public readonly batchText = signal('');
  public readonly batchItems = signal<BatchQrItem[]>([]);

  /**
   * Alterna entre a geração de um único QR Code e a geração em lote.
   */
  public setBatchMode(enabled: boolean): void {
    this.isBatchMode.set(enabled);
    this.errorMessage.set(null);
  }

  /**
   * Atualiza o texto/URL que será codificado no QR Code.
   */
  public onTextChange(event: Event): void {
    this.text.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Atualiza o nível de correção de erro selecionado.
   */
  public onEclevelChange(event: Event): void {
    this.eclevel.set((event.target as HTMLSelectElement).value as QrErrorCorrection);
  }

  /**
   * Atualiza o tamanho selecionado para o QR Code.
   */
  public onScaleChange(event: Event): void {
    this.scale.set(Number((event.target as HTMLSelectElement).value));
  }

  /**
   * Gera a pré-visualização do QR Code a partir do texto informado.
   */
  public generate(): void {
    const value = this.text().trim();
    if (!value) {
      this.errorMessage.set('Informe um texto ou URL para gerar o QR Code.');
      this.previewDataUrl.set(null);
      return;
    }
    try {
      const dataUrl = renderToPngDataUrl(buildQrCodeOptions(value, this.eclevel(), this.scale()));
      this.previewDataUrl.set(dataUrl);
      this.errorMessage.set(null);
    } catch (error) {
      this.previewDataUrl.set(null);
      this.errorMessage.set(toFriendlyError(error));
    }
  }

  /**
   * Baixa o QR Code gerado como imagem PNG.
   */
  public downloadPng(): void {
    const dataUrl = this.previewDataUrl();
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, `qrcode-${sanitizeFileNamePart(this.text())}.png`);
  }

  /**
   * Baixa o QR Code gerado como arquivo SVG vetorial.
   */
  public downloadSvg(): void {
    const value = this.text().trim();
    if (!value) return;
    try {
      const svg = renderToSvg(buildQrCodeOptions(value, this.eclevel(), this.scale()));
      downloadTextAsFile(svg, `qrcode-${sanitizeFileNamePart(value)}.svg`, 'image/svg+xml');
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
   */
  public onBatchTextChange(event: Event): void {
    this.batchText.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Gera um QR Code para cada linha informada no lote.
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
    const items: BatchQrItem[] = lines.map((value) => {
      try {
        const dataUrl = renderToPngDataUrl(buildQrCodeOptions(value, this.eclevel(), this.scale()));
        return { value, dataUrl, error: null };
      } catch (error) {
        return { value, dataUrl: null, error: toFriendlyError(error) };
      }
    });
    this.batchItems.set(items);
  }

  /**
   * Baixa todos os QR Codes gerados com sucesso no lote como um único arquivo .zip.
   */
  public async downloadBatchZip(): Promise<void> {
    const items = this.batchItems()
      .filter((item): item is BatchQrItem & { dataUrl: string } => item.dataUrl !== null)
      .map((item, index) => ({
        fileName: `${index + 1}-${sanitizeFileNamePart(item.value)}.png`,
        dataUrl: item.dataUrl,
      }));
    if (items.length === 0) return;
    await downloadPngBatchAsZip(items, 'qrcodes.zip');
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
