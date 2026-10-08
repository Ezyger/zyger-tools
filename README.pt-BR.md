# Zyger Tools

[Read in English](README.md)

Uma aplicação web simples e focada, reunindo ferramentas para desenvolvedores com foco em privacidade. As ferramentas disponíveis são **JSON → Excel**, **Formatador de JSON**, **Gerador de QR Code** e **Gerador de Código de Barras**.

Este projeto faz parte do meu portfólio profissional e foi construído com um objetivo explícito: **simplicidade acima de sofisticação**. Cada decisão de design favorece código legível e explicável em vez de arquiteturas complexas.

## Problema que resolve

Desenvolvedores frequentemente precisam transformar dados JSON (respostas de API, exports, logs) em planilhas para análise rápida, relatórios ou compartilhamento com pessoas não técnicas. Isso geralmente significa escrever um script descartável ou colar os dados em um conversor online de confiança desconhecida — muitas vezes com dados sensíveis envolvidos.

O Zyger Tools resolve isso com uma ferramenta que roda **100% no navegador**: nada do que você cola ou envia sai do seu dispositivo.

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
- **Formatador de JSON**
  - Cole qualquer texto JSON e formate com indentação de 2 espaços, 4 espaços ou tabulação.
  - Minifique o JSON, removendo todos os espaços desnecessários.
  - Erros de sintaxe são reportados com uma mensagem clara, em vez do erro bruto do parser.
  - Copie o resultado para a área de transferência ou baixe como arquivo `.json`.
- **Gerador de QR Code**
  - Gere QR Codes a partir de texto ou URL, com níveis de correção de erro (L, M, Q, H) e tamanhos configuráveis.
  - Baixe o resultado como PNG ou SVG.
  - Modo em lote: gere até 300 QR Codes de uma vez (um valor por linha) e baixe todos em um único arquivo `.zip`.
- **Gerador de Código de Barras**
  - Gere códigos nos formatos GS1-128, Code 128, EAN-13, EAN-8, UPC-A, Code 39, Code 93, ITF, Codabar, PDF417 e Data Matrix.
  - Escolha o tamanho e opte por exibir ou não o texto legível abaixo do código.
  - Baixe o resultado como PNG ou SVG.
  - Modo em lote: gere até 300 códigos de uma vez (um valor por linha) e baixe todos em um único arquivo `.zip`.
- Alternância entre tema claro e escuro.
- Outras ferramentas (JSON → CSV, CSV → JSON, etc.) estão planejadas e aparecem como "Em breve" na página inicial, mas ainda não foram implementadas.

## Privacidade

Todo o processamento de todas as ferramentas acontece localmente no navegador:

- Seus arquivos e dados nunca são enviados para nenhum servidor ou API de terceiros.
- Nada é armazenado externamente ou usado para analytics.
- Nenhum dado permanece salvo após fechar ou recarregar a página.

**Seus dados nunca saem do seu dispositivo.**

## Tecnologias

- [Angular](https://angular.dev) (standalone components, signals, nova sintaxe de controle de fluxo `@if`/`@for`)
- TypeScript
- SCSS
- [SheetJS (xlsx)](https://sheetjs.com) para geração dos arquivos `.xlsx`
- bwip-js, para renderização de QR Codes e códigos de barras
- JSZip, para downloads em lote como arquivo `.zip`

Sem backend, sem banco de dados, sem autenticação, sem gerenciamento de estado global — nada disso é necessário para o que esta aplicação faz.

> **Nota sobre a dependência `xlsx`:** a versão publicada no registro público do npm está desatualizada e sinalizada com vulnerabilidades conhecidas (prototype pollution e ReDoS) sem correção disponível ali. Este projeto instala a build corrigida diretamente do [CDN oficial do SheetJS](https://cdn.sheetjs.com/), conforme recomendado pelos mantenedores, resultando em zero vulnerabilidades conhecidas (`npm audit`).

## Estrutura do projeto

```
src/app/
  home/                 Página inicial com a lista de ferramentas
  tools/
    json-to-excel/       Funcionalidade JSON → Excel (componente + funções utilitárias puras)
    json-formatter/       Funcionalidade Formatador de JSON (componente + funções utilitárias puras)
    qrcode-generator/     Funcionalidade Gerador de QR Code (componente + funções utilitárias puras)
    barcode-generator/    Funcionalidade Gerador de Código de Barras (componente + funções utilitárias puras)
  shared/                Serviço de tema, tipos compartilhados e renderização/download de QR Code e código de barras
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

Os testes focam nas funções que possuem lógica real (parsing, validação e formatação de JSON; achatamento de objetos e detecção de colunas; montagem das opções de QR Code e código de barras; parsing de lote e sanitização de nomes de arquivo), cobrindo JSON válido/inválido, objeto único, array de objetos e achatamento de campos aninhados/arrays.

## Build

```bash
npm run build
```

## Roadmap

Ferramentas já implementadas:

- [x] JSON → Excel
- [x] Formatador de JSON
- [x] Gerador de QR Code
- [x] Gerador de Código de Barras

Ferramentas planejadas, ainda não implementadas:

- JSON → CSV / CSV → JSON
- Excel → JSON
- Timestamp Converter
- Base64 Encode / Decode
