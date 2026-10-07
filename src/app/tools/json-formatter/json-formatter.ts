import { Component, signal } from '@angular/core';
import { downloadTextFile, formatJson, IndentOption, minifyJson } from './json-formatter.utils';

@Component({
  selector: 'app-json-formatter',
  imports: [],
  templateUrl: './json-formatter.html',
  styleUrl: './json-formatter.scss',
})
export class JsonFormatter {
  public readonly inputText = signal('');
  public readonly outputText = signal('');
  public readonly indent = signal<IndentOption>('2');
  public readonly errorMessage = signal<string | null>(null);

  /**
   * Atualiza o texto de entrada conforme o usuário digita ou cola conteúdo.
   */
  public onInputChange(event: Event): void {
    this.inputText.set((event.target as HTMLTextAreaElement).value);
  }

  /**
   * Atualiza a opção de indentação usada ao formatar.
   */
  public onIndentChange(event: Event): void {
    this.indent.set((event.target as HTMLSelectElement).value as IndentOption);
  }

  /**
   * Formata o JSON de entrada com a indentação selecionada.
   */
  public format(): void {
    this.run(() => formatJson(this.inputText(), this.indent()));
  }

  /**
   * Minifica o JSON de entrada, removendo espaços desnecessários.
   */
  public minify(): void {
    this.run(() => minifyJson(this.inputText()));
  }

  /**
   * Copia o resultado atual para a área de transferência.
   */
  public async copyToClipboard(): Promise<void> {
    if (!this.outputText()) return;
    await navigator.clipboard.writeText(this.outputText());
  }

  /**
   * Baixa o resultado atual como um arquivo .json.
   */
  public download(): void {
    if (!this.outputText()) return;
    downloadTextFile(this.outputText(), 'formatado.json');
  }

  /**
   * Limpa os campos de entrada e resultado.
   */
  public clear(): void {
    this.inputText.set('');
    this.outputText.set('');
    this.errorMessage.set(null);
  }

  /**
   * Executa uma ação de formatação ou minificação, capturando erros e atualizando os sinais de saída e mensagem de erro.
   * @param action A função que realiza a ação de formatação ou minificação e retorna o resultado como string.
   */
  private run(action: () => string): void {
    try {
      this.outputText.set(action());
      this.errorMessage.set(null);
    } catch (error) {
      this.outputText.set('');
      this.errorMessage.set(error instanceof Error ? error.message : 'Não foi possível processar o JSON informado.');
    }
  }
}
