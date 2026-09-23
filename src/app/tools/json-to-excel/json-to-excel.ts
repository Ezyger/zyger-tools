import { Component, computed, signal } from '@angular/core';
import {
  exportToExcel,
  flattenObject,
  getColumns,
  JsonRecord,
  MAX_FILE_SIZE_BYTES,
  parseJson,
  toRows,
} from './json-to-excel.utils';

interface ColumnState {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-json-to-excel',
  imports: [],
  templateUrl: './json-to-excel.html',
  styleUrl: './json-to-excel.scss',
})
export class JsonToExcel {
  private static readonly PREVIEW_LIMIT = 50;

  public readonly errorMessage = signal<string | null>(null);
  public readonly rows = signal<JsonRecord[]>([]);
  public readonly columns = signal<ColumnState[]>([]);
  public readonly fileName = signal('dados.xlsx');
  public readonly isDragOver = signal(false);

  public readonly hasData = computed(() => this.rows().length > 0);
  public readonly previewRows = computed(() => this.rows().slice(0, JsonToExcel.PREVIEW_LIMIT));
  public readonly selectedColumnNames = computed(() =>
    this.columns()
      .filter((column) => column.selected)
      .map((column) => column.name),
  );

  /**
   * Lê o arquivo selecionado no input de upload e inicia o processamento do JSON.
   */
  public onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      void this.handleFile(file);
    }
    input.value = '';
  }

  /**
   * Destaca a dropzone enquanto um arquivo é arrastado sobre ela.
   */
  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  /**
   * Remove o destaque da dropzone quando o arraste sai da área.
   */
  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  /**
   * Processa o arquivo solto na dropzone.
   */
  public onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      void this.handleFile(file);
    }
  }

  /**
   * Processa o JSON colado manualmente na textarea.
   */
  public onProcessPastedText(textarea: HTMLTextAreaElement): void {
    this.processJson(textarea.value);
  }

  /**
   * Alterna a seleção de uma coluna para a exportação.
   */
  public toggleColumn(name: string): void {
    this.columns.update((cols) =>
      cols.map((column) => (column.name === name ? { ...column, selected: !column.selected } : column)),
    );
  }

  /**
   * Marca todas as colunas para exportação.
   */
  public selectAllColumns(): void {
    this.columns.update((cols) => cols.map((column) => ({ ...column, selected: true })));
  }

  /**
   * Remove a seleção de todas as colunas.
   */
  public deselectAllColumns(): void {
    this.columns.update((cols) => cols.map((column) => ({ ...column, selected: false })));
  }

  /**
   * Atualiza o nome do arquivo que será exportado.
   */
  public onFileNameChange(event: Event): void {
    this.fileName.set((event.target as HTMLInputElement).value);
  }

  /**
   * Gera e baixa o arquivo Excel apenas com as colunas selecionadas.
   */
  public exportFile(): void {
    const selected = this.selectedColumnNames();
    if (selected.length === 0) {
      this.errorMessage.set('Selecione ao menos uma coluna para exportar.');
      return;
    }
    try {
      const name = this.fileName().trim() || 'dados.xlsx';
      const finalName = name.toLowerCase().endsWith('.xlsx') ? name : `${name}.xlsx`;
      exportToExcel(this.rows(), selected, finalName);
      this.errorMessage.set(null);
    } catch {
      this.errorMessage.set('Ocorreu um erro ao gerar o arquivo Excel.');
    }
  }

  /**
   * Limpa os dados carregados e volta para a tela inicial da ferramenta.
   */
  public reset(): void {
    this.rows.set([]);
    this.columns.set([]);
    this.errorMessage.set(null);
    this.fileName.set('dados.xlsx');
  }

  private async handleFile(file: File): Promise<void> {
    this.errorMessage.set(null);
    if (!file.name.toLowerCase().endsWith('.json')) {
      this.errorMessage.set('Apenas arquivos .json são suportados.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.errorMessage.set(
        'O arquivo é muito grande para processamento local. O limite atual é 10 MB.',
      );
      return;
    }
    const text = await file.text();
    this.processJson(text);
  }

  private processJson(text: string): void {
    try {
      const data = parseJson(text);
      const flatRows = toRows(data).map((row) => flattenObject(row));
      const columnNames = getColumns(flatRows);
      if (columnNames.length === 0) {
        throw new Error('Nenhum campo foi encontrado no JSON informado.');
      }
      this.rows.set(flatRows);
      this.columns.set(columnNames.map((name) => ({ name, selected: true })));
      this.errorMessage.set(null);
    } catch (error) {
      this.rows.set([]);
      this.columns.set([]);
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Não foi possível processar o JSON informado.',
      );
    }
  }
}
