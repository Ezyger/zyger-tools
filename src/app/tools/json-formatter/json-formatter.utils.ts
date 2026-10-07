export type IndentOption = '2' | '4' | 'tab';

/** 
 * Analisa o texto bruto como JSON, lançando um erro amigável ao usuário em caso de sintaxe inválida.
 * @param text O texto bruto do JSON a ser analisado.
 * @returns O objeto JSON analisado.
 */
export function parseJsonText(text: string): unknown {
  if (text.trim() === '') {
    throw new Error('O conteúdo informado está vazio.');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('O JSON informado possui um erro de sintaxe.');
  }
}

/** 
 * Formata o texto JSON usando a indentação fornecida (2 ou 4 espaços, ou uma tabulação).
 * @param text O texto bruto do JSON a ser formatado.
 * @param indent A opção de indentação a ser usada ('2', '4' ou 'tab').
 * @returns O texto JSON formatado.
 */
export function formatJson(text: string, indent: IndentOption): string {
  const data = parseJsonText(text);
  return JSON.stringify(data, null, indent === 'tab' ? '\t' : Number(indent));
}

/** 
 * Minifica o texto JSON removendo todos os espaços em branco desnecessários.
 * @param text O texto bruto do JSON a ser minificado.
 * @returns O texto JSON minificado.
 */
export function minifyJson(text: string): string {
  const data = parseJsonText(text);
  return JSON.stringify(data);
}

/** 
 * Aciona o download no navegador do texto fornecido como um arquivo.
 * @param text O conteúdo de texto a ser baixado.
 * @param fileName O nome do arquivo a ser baixado.
 */
export function downloadTextFile(text: string, fileName: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
