# DevTools

[Read in English](README.md)

Uma aplicação web simples e focada, reunindo ferramentas para desenvolvedores com foco em privacidade. A primeira ferramenta disponível é o **JSON → Excel**, um conversor que transforma dados JSON em planilhas `.xlsx` inteiramente no navegador.

Este projeto faz parte do meu portfólio profissional e foi construído com um objetivo explícito: **simplicidade acima de sofisticação**. Cada decisão de design favorece código legível e explicável em vez de arquiteturas complexas.

## Problema que resolve

Desenvolvedores frequentemente precisam transformar dados JSON (respostas de API, exports, logs) em planilhas para análise rápida, relatórios ou compartilhamento com pessoas não técnicas. Isso geralmente significa escrever um script descartável ou colar os dados em um conversor online de confiança desconhecida — muitas vezes com dados sensíveis envolvidos.

O DevTools resolve isso com uma ferramenta que roda **100% no navegador**: nada do que você cola ou envia sai do seu dispositivo.

## Funcionalidades

- **JSON → Excel**
  - Upload de um arquivo `.json`, arrastar e soltar, ou colar o JSON diretamente.
  - Validação de sintaxe e estrutura do JSON, com mensagens de erro claras.
  - Suporta um objeto único (tratado como uma linha) ou um array de objetos.
  - Achata objetos aninhados em colunas usando dot notation (ex.: `customer.city`).
  - Arrays simples viram uma string separada por vírgulas; arrays de objetos são mantidos como texto JSON.
  - Tabela de preview (até 50 linhas) mostrando totais de registros e campos.
  - Seleção de colunas antes da exportação (selecionar todas / desmarcar todas / individual).
  - Nome do arquivo de saída personalizável.
  - Limite de 10 MB no arquivo de entrada (processamento local).
- Alternância entre tema claro e escuro.
- Outras ferramentas (JSON Formatter, CSV ↔ JSON, etc.) estão planejadas e aparecem como "Em breve" na página inicial, mas ainda não foram implementadas.

## Privacidade

Todo o processamento acontece localmente no navegador:

- Seu JSON nunca é enviado para nenhum servidor ou API de terceiros.
- Nada é armazenado externamente ou usado para analytics.
- Nenhum dado permanece salvo após fechar ou recarregar a página.

## Tecnologias

- [Angular](https://angular.dev) (standalone components, signals, nova sintaxe de controle de fluxo `@if`/`@for`)
- TypeScript
- SCSS
- [SheetJS (xlsx)](https://sheetjs.com) para geração dos arquivos `.xlsx`

Sem backend, sem banco de dados, sem autenticação, sem gerenciamento de estado global — nada disso é necessário para o que esta aplicação faz.

> **Nota sobre a dependência `xlsx`:** a versão publicada no registro público do npm está desatualizada e sinalizada com vulnerabilidades conhecidas (prototype pollution e ReDoS) sem correção disponível ali. Este projeto instala a build corrigida diretamente do [CDN oficial do SheetJS](https://cdn.sheetjs.com/), conforme recomendado pelos mantenedores, resultando em zero vulnerabilidades conhecidas (`npm audit`).

## Estrutura do projeto

```
src/app/
  home/                 Página inicial com a lista de ferramentas
  tools/
    json-to-excel/       Funcionalidade JSON → Excel (componente + funções utilitárias puras)
  shared/                Serviço de tema e tipos compartilhados
  app.routes.ts          Definição de rotas
```

Nenhuma camada de repository/facade/use-case/adapter foi criada — a aplicação é pequena o suficiente para que isso só adicionaria indireção sem benefício real.

## Como executar

```bash
npm install
npm start
```

A aplicação estará disponível em `http://localhost:4200`.

## Como testar

```bash
npm test
```

Os testes focam nas funções que possuem lógica real (`parseJson`, `toRows`, `flattenObject`, `getColumns`), cobrindo JSON válido/inválido, objeto único, array de objetos e achatamento de campos aninhados/arrays.

## Build

```bash
npm run build
```

## Roadmap

Ferramentas planejadas, ainda não implementadas:

- JSON Formatter / Viewer
- JSON → CSV / CSV → JSON
- Excel → JSON
- Timestamp Converter
- Base64 Encode / Decode
