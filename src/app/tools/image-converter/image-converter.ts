import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { exportCanvasImage, IMAGE_OUTPUT_FORMATS, ImageOutputFormat } from '../../shared/image-export.util';
import { ImageVectorizer } from './image-vectorizer.service';
import { MAX_VECTOR_PIXELS, VECTOR_COLORS, VectorDetail } from './image-vectorizer.model';

interface ImageInfo {
  name: string;
  width: number;
  height: number;
  bytes: number;
  svg: boolean;
}

const MAX_FILE_BYTES = 64 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;

@Component({
  selector: 'app-image-converter',
  imports: [],
  providers: [ImageVectorizer],
  templateUrl: './image-converter.html',
  styleUrl: './image-converter.scss',
})
export class ImageConverter implements OnDestroy {
  public readonly svgMode = signal<'embed' | 'vector'>('embed');
  public readonly vectorColors = signal(32);
  public readonly vectorDetail = signal<VectorDetail>('fine');
  public readonly colorOptions = VECTOR_COLORS;
  public readonly isVectorizing = signal(false);
  public readonly previewZoom = signal(0);
  public readonly formats = IMAGE_OUTPUT_FORMATS.map((format) => ({ ...format, label: format.value.toUpperCase() }));
  public readonly format = signal<ImageOutputFormat>('png');
  public readonly scale = signal(1);
  public readonly originalUrl = signal<string | null>(null);
  public readonly resultUrl = signal<string | null>(null);
  public readonly info = signal<ImageInfo | null>(null);
  public readonly resultBytes = signal<number | null>(null);
  public readonly isProcessing = signal(false);
  public readonly errorMessage = signal<string | null>(null);
  public readonly outputWidth = computed(() => (this.info()?.width ?? 0) * this.scale());
  public readonly outputHeight = computed(() => (this.info()?.height ?? 0) * this.scale());
  private readonly vectorizer = inject(ImageVectorizer);
  private image: HTMLImageElement | null = null;
  private originalFile: File | null = null;
  private generation = 0;

  /**
   * Abre a imagem sem reduzir suas dimensões ou enviar o arquivo a um servidor.
   */
  public async onFileInputChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.clear();
    if (file.size > MAX_FILE_BYTES) {
      this.errorMessage.set('Escolha uma imagem de até 64 MB.');
      return;
    }
    const generation = this.generation;
    const url = URL.createObjectURL(file);
    this.isProcessing.set(true);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (generation !== this.generation) return;
      this.validateDimensions(image.naturalWidth, image.naturalHeight);
      this.image = image;
      this.originalFile = file;
      this.originalUrl.set(url);
      this.info.set({
        name: file.name,
        width: image.naturalWidth,
        height: image.naturalHeight,
        bytes: file.size,
        svg: file.type === 'image/svg+xml' || /\.svg$/i.test(file.name),
      });
    } catch (error) {
      if (generation === this.generation) {
        this.errorMessage.set(
          error instanceof Error && error.message.startsWith('Use ')
            ? error.message
            : 'Não foi possível abrir a imagem. Escolha um formato compatível com o navegador.',
        );
      }
    } finally {
      if (this.originalUrl() !== url) URL.revokeObjectURL(url);
      if (generation === this.generation) this.isProcessing.set(false);
    }
  }

  /**
   * Exporta em qualidade máxima, preservando o SVG original quando não há transformação.
   */
  public async convert(): Promise<void> {
    const image = this.image;
    if (!image || this.isProcessing()) return;
    const generation = this.generation;
    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.invalidateResult();
    try {
      this.validateDimensions(this.outputWidth(), this.outputHeight());
      const vectorize = this.format() === 'svg' && this.svgMode() === 'vector' && !this.info()?.svg;
      if (vectorize && this.outputWidth() * this.outputHeight() > MAX_VECTOR_PIXELS) {
        throw new Error(
          'A vetorização suporta até 4 megapixels. Use uma imagem menor ou escolha incorporar, que aceita até 40 megapixels.',
        );
      }
      let blob: Blob;
      if (this.info()?.svg && this.format() === 'svg' && this.scale() === 1 && this.originalFile) {
        blob = this.originalFile.slice(0, this.originalFile.size, 'image/svg+xml');
      } else {
        const canvas = document.createElement('canvas');
        canvas.width = this.outputWidth();
        canvas.height = this.outputHeight();
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Seu navegador não permite converter esta imagem.');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        if (vectorize) {
          this.isVectorizing.set(true);
          const svg = await this.vectorizer.vectorize(context.getImageData(0, 0, canvas.width, canvas.height), {
            colors: this.vectorColors(),
            detail: this.vectorDetail(),
          });
          blob = new Blob([svg], { type: 'image/svg+xml' });
        } else {
          blob = await exportCanvasImage(canvas, this.format());
        }
      }
      if (generation !== this.generation) return;
      this.resultBytes.set(blob.size);
      this.resultUrl.set(URL.createObjectURL(blob));
    } catch (error) {
      if (generation === this.generation) {
        this.errorMessage.set(error instanceof Error && error.message ? error.message : 'Não foi possível converter a imagem.');
      }
    } finally {
      if (generation === this.generation) {
        this.isProcessing.set(false);
        this.isVectorizing.set(false);
      }
    }
  }

  /**
   * Alterna entre incorporar os pixels e vetorizar os contornos no SVG.
   */
  public onSvgModeChange(event: Event): void {
    if (this.isProcessing()) return;
    const value = (event.target as HTMLSelectElement).value;
    if (value !== 'embed' && value !== 'vector') return;
    this.svgMode.set(value);
    this.errorMessage.set(null);
    this.invalidateResult();
  }

  /**
   * Atualiza o limite de cores usado na vetorização.
   */
  public onVectorColorsChange(event: Event): void {
    if (this.isProcessing()) return;
    const value = Number((event.target as HTMLSelectElement).value);
    if (!VECTOR_COLORS.includes(value)) return;
    this.vectorColors.set(value);
    this.invalidateResult();
  }

  /**
   * Atualiza a fidelidade e a suavização dos contornos vetoriais.
   */
  public onVectorDetailChange(event: Event): void {
    if (this.isProcessing()) return;
    const value = (event.target as HTMLSelectElement).value;
    if (value !== 'fine' && value !== 'balanced' && value !== 'smooth') return;
    this.vectorDetail.set(value);
    this.invalidateResult();
  }

  /**
   * Interrompe o traçado e descarta resultados pendentes.
   */
  public cancelVectorization(): void {
    this.generation++;
    this.vectorizer.cancel();
    this.isProcessing.set(false);
    this.isVectorizing.set(false);
  }

  /**
   * Ajusta apenas o zoom da prévia, sem alterar o arquivo exportado.
   */
  public onPreviewZoomChange(event: Event): void {
    const zoom = Number((event.target as HTMLSelectElement).value);
    if ([0, 1, 2, 4, 8].includes(zoom)) this.previewZoom.set(zoom);
  }

  /**
   * Atualiza o formato de saída e invalida o resultado anterior.
   */
  public onFormatChange(event: Event): void {
    if (this.isProcessing()) return;
    const value = (event.target as HTMLSelectElement).value;
    if (!IMAGE_OUTPUT_FORMATS.some((format) => format.value === value)) return;
    this.format.set(value as ImageOutputFormat);
    if (value === 'svg') this.scale.set(1);
    this.errorMessage.set(null);
    this.invalidateResult();
  }

  /**
   * Atualiza a resolução usada para renderizar o SVG.
   */
  public onScaleChange(event: Event): void {
    if (this.isProcessing()) return;
    const value = Number((event.target as HTMLSelectElement).value);
    if (![1, 2, 4].includes(value) || !this.info()?.svg) return;
    this.scale.set(value);
    this.errorMessage.set(null);
    this.invalidateResult();
  }

  /**
   * Monta o nome do download conforme a imagem e o formato selecionados.
   */
  public downloadName(): string {
    const suffix = this.format() === 'svg' && this.svgMode() === 'vector' && !this.info()?.svg ? 'vetorizada' : 'convertida';
    return `${this.info()?.name.replace(/\.[^.]+$/, '') || 'imagem'}-${suffix}.${this.format()}`;
  }

  /**
   * Formata o tamanho do arquivo em KB ou MB para exibição.
   */
  public formatBytes(bytes: number): string {
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Limpa a imagem e o resultado, cancelando tarefas e liberando as URLs temporárias.
   */
  public clear(): void {
    this.generation++;
    this.vectorizer.cancel();
    this.isVectorizing.set(false);
    const original = this.originalUrl();
    if (original) URL.revokeObjectURL(original);
    this.originalUrl.set(null);
    this.invalidateResult();
    this.info.set(null);
    this.image = null;
    this.originalFile = null;
    this.scale.set(1);
    this.errorMessage.set(null);
    this.isProcessing.set(false);
  }

  /**
   * Libera os recursos da ferramenta quando o componente é destruído.
   */
  public ngOnDestroy(): void {
    this.clear();
  }

  /**
   * Descarta o resultado anterior e libera sua URL temporária.
   */
  private invalidateResult(): void {
    const result = this.resultUrl();
    if (result) URL.revokeObjectURL(result);
    this.resultUrl.set(null);
    this.resultBytes.set(null);
  }

  /**
   * Valida a resolução sem reduzir a imagem automaticamente.
   */
  private validateDimensions(width: number, height: number): void {
    if (width <= 0 || height <= 0 || width * height > MAX_PIXELS) {
      throw new Error('Use dimensões válidas de até 40 megapixels. A imagem não será reduzida automaticamente.');
    }
  }
}
