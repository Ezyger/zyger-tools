import { Component, OnDestroy, signal } from '@angular/core';
import { removeBackground } from './background-remover.utils';
import { exportBackgroundImage, OUTPUT_FORMATS, OutputFormat } from './background-remover-export.utils';

@Component({
  selector: 'app-background-remover',
  imports: [],
  templateUrl: './background-remover.html',
  styleUrl: './background-remover.scss',
})
export class BackgroundRemover implements OnDestroy {
  public readonly originalUrl = signal<string | null>(null);
  public readonly resultUrl = signal<string | null>(null);
  public readonly error = signal<string | null>(null);
  public readonly busy = signal(false);
  public readonly color = signal('#ffffff');
  public readonly tolerance = signal(30);
  public readonly connectedOnly = signal(true);
  public readonly fileName = signal('');
  public readonly outputFormats = OUTPUT_FORMATS;
  public readonly outputFormat = signal<OutputFormat>('png');
  private source: ImageData | null = null;
  private generation = 0;
  private resultCanvas: HTMLCanvasElement | null = null;

  /**
   * Limpa os recursos quando o componente é destruído, garantindo que não haja vazamentos de memória.
   * Isso é chamado automaticamente pelo Angular quando o componente é removido da árvore de componentes.
   */
  public ngOnDestroy(): void {
    this.clear();
  }

  /**
   * Seleciona um arquivo de imagem para remover o fundo.
   * @param event O evento de mudança do input de arquivo.
   */
  public async selectFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.clear();
    const generation = this.generation;
    if (file.size > 20 * 1024 * 1024) {
      this.error.set('Escolha uma imagem de até 20 MB.');
      return;
    }
    this.busy.set(true);
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (generation !== this.generation) return;
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 8_000_000) {
        throw new Error('Use uma imagem com até 8 megapixels e dimensões válidas.');
      }
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Seu navegador não permite processar esta imagem.');
      context.drawImage(image, 0, 0);
      const source = context.getImageData(0, 0, canvas.width, canvas.height);
      this.source = source;
      // Sugere a cor do primeiro canto visível; o usuário pode alterá-la.
      const corners = [0, canvas.width - 1, (canvas.height - 1) * canvas.width, canvas.width * canvas.height - 1];
      const corner = corners.find((pixel) => source.data[pixel * 4 + 3] > 0);
      if (corner !== undefined) {
        const rgb = source.data.slice(corner * 4, corner * 4 + 3);
        this.color.set('#' + Array.from(rgb, (value) => value.toString(16).padStart(2, '0')).join(''));
      }
      this.originalUrl.set(url);
      this.fileName.set(file.name);
    } catch (error) {
      if (generation === this.generation) {
        this.error.set(
          error instanceof Error && error.message.startsWith('Use ')
            ? error.message
            : 'Não foi possível abrir a imagem. Use PNG, JPEG, SVG, WebP ou outro formato compatível com seu navegador.',
        );
      }
    } finally {
      if (this.originalUrl() !== url) URL.revokeObjectURL(url);
      if (generation === this.generation) this.busy.set(false);
    }
  }

  /**
   * Remove o fundo da imagem selecionada, usando a cor e tolerância definidas.
   */
  public async remove(): Promise<void> {
    const source = this.source;
    if (!source || this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.invalidateResult();
    const generation = this.generation;
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (generation !== this.generation) return;
      const rgb = [1, 3, 5].map((offset) => parseInt(this.color().slice(offset, offset + 2), 16));
      const pixels = removeBackground(source.data, source.width, source.height, rgb, this.tolerance(), this.connectedOnly());
      const canvas = document.createElement('canvas');
      canvas.width = source.width;
      canvas.height = source.height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      const result = context.createImageData(source.width, source.height);
      result.data.set(pixels);
      context.putImageData(result, 0, 0);
      this.resultCanvas = canvas;
      const blob = await exportBackgroundImage(canvas, this.outputFormat());
      if (generation === this.generation) this.resultUrl.set(URL.createObjectURL(blob));
    } catch (error) {
      if (generation === this.generation) {
        this.error.set(
          error instanceof Error && error.message ? error.message : 'Não foi possível remover o fundo. Tente uma imagem menor.',
        );
      }
    } finally {
      if (generation === this.generation) this.busy.set(false);
    }
  }

  /**
   * Atualiza a cor usada para remover o fundo.
   * @param event O evento de mudança do input de cor.
   */
  public updateColor(event: Event): void {
    this.color.set((event.target as HTMLInputElement).value);
    this.invalidateResult();
  }

  /**
   * Atualiza o formato de saída da imagem resultante.
   * @param event O evento de mudança do select de formato.
   */
  public async updateFormat(event: Event): Promise<void> {
    if (this.busy()) return;
    const value = (event.target as HTMLSelectElement).value;
    if (!OUTPUT_FORMATS.some((format) => format.value === value)) return;
    this.outputFormat.set(value as OutputFormat);
    const canvas = this.resultCanvas;
    if (!canvas) return;
    this.busy.set(true);
    this.error.set(null);
    const generation = this.generation;
    const oldUrl = this.resultUrl();
    if (oldUrl) URL.revokeObjectURL(oldUrl);
    this.resultUrl.set(null);
    try {
      const blob = await exportBackgroundImage(canvas, this.outputFormat());
      if (generation === this.generation) this.resultUrl.set(URL.createObjectURL(blob));
    } catch (error) {
      if (generation === this.generation) {
        this.error.set(error instanceof Error ? error.message : 'Não foi possível exportar a imagem.');
      }
    } finally {
      if (generation === this.generation) this.busy.set(false);
    }
  }

  /**
   * Atualiza a tolerância usada para remover o fundo.
   * @param event O evento de mudança do input de número.
   */
  public updateTolerance(event: Event): void {
    this.tolerance.set(Number((event.target as HTMLInputElement).value));
    this.invalidateResult();
  }

  /**
   * Atualiza se apenas pixels conectados à borda devem ser removidos.
   * @param event O evento de mudança do input de checkbox.
   */
  public updateConnected(event: Event): void {
    this.connectedOnly.set((event.target as HTMLInputElement).checked);
    this.invalidateResult();
  }

  /**
   * Invalida o resultado atual, liberando a URL do objeto e limpando o canvas de resultado.
   * Isso é chamado sempre que a imagem original ou os parâmetros de remoção são alterados.
   */
  private invalidateResult(): void {
    this.resultCanvas = null;
    const url = this.resultUrl();
    if (url) URL.revokeObjectURL(url);
    this.resultUrl.set(null);
  }

  /**
   * Limpa todos os dados e libera recursos, incluindo URLs de objetos e canvas de resultado.
   * Isso é chamado quando o usuário seleciona uma nova imagem ou quando o componente é destruído.
   */
  public clear(): void {
    this.generation++;
    const url = this.originalUrl();
    if (url) URL.revokeObjectURL(url);
    this.originalUrl.set(null);
    this.invalidateResult();
    this.source = null;
    this.fileName.set('');
    this.error.set(null);
    this.busy.set(false);
  }

  /**
   * Gera o nome do arquivo de download com base no nome original e no formato de saída selecionado.
   * @returns O nome do arquivo de download, com a extensão apropriada.
   */
  public downloadName(): string {
    return `${this.fileName().replace(/\.[^.]+$/, '') || 'imagem'}-sem-fundo.${this.outputFormat()}`;
  }
}
