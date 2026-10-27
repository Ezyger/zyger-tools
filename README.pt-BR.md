# Zyger Tools

[Read in English](README.md)

Uma aplicação web simples e focada, reunindo ferramentas para desenvolvedores com foco em privacidade. As ferramentas disponíveis são **JSON → Excel**, **Formatador de JSON**, **Gerador de QR Code** e **Gerador de Código de Barras**.

Este projeto faz parte do meu portfólio profissional e foi construído com um objetivo explícito: **simplicidade acima de sofisticação**. Cada decisão de design favorece código legível e explicável em vez de arquiteturas complexas.

## Problema que resolve

Desenvolvedores frequentemente precisam transformar dados JSON (respostas de API, exports, logs) em planilhas para análise rápida, relatórios ou compartilhamento com pessoas não técnicas. Isso geralmente significa escrever um script descartável ou colar os dados em um conversor online de confiança desconhecida — muitas vezes com dados sensíveis envolvidos.

O Zyger Tools resolve isso com uma ferramenta que roda **100% no navegador**: nada do que você cola ou envia sai do seu dispositivo.

## Funcionalidades

- **Conversor de imagens** (`/tools/image-converter`)
  - Converte imagens compatíveis com o navegador para PNG, SVG, JPEG e WebP, localmente.
  - Preserva as dimensões originais, sem reduzir a resolução automaticamente; limite de 64 MB e 40 megapixels.
  - PNG sem perdas e SVG com PNG incorporado sem perdas; JPEG/WebP com qualidade máxima do encoder (ainda sujeitos a perdas).
  - Duas opções para PNG/JPEG/WebP → SVG: incorporar o PNG sem perdas ou vetorizar em curvas editáveis.
  - Vetorização local com ImageTracerJS (Unlicense), em Web Worker, com cancelamento, paleta de 4 a 64 cores e três níveis de detalhes/suavização. Limite de 4 megapixels, sem redução automática.
  - O traçado aproxima a imagem e pode alterar detalhes: indicado para logos e ícones, não para fotografias. SVG para SVG preserva o arquivo original.
  - SVG pode ser renderizado em 1×, 2× ou 4× para PNG/JPEG/WebP, aproveitando os detalhes vetoriais.
  - Transparência preservada em PNG, WebP e SVG; JPEG utiliza fundo branco. Metadados DPI/EXIF podem ser removidos.

- **Removedor de fundo** (`/tools/background-remover`)
  - Upload de PNG, JPEG, SVG, WebP e outros formatos compatíveis com o navegador, até 20 MB e 8 megapixels.
  - Remoção de fundos uniformes por cor, com tolerância ajustável e opção de preservar áreas internas.
  - Prévia e exportação em PNG, WebP, JPEG (fundo branco) ou SVG com PNG incorporado, sem vetorização.
  - Processamento local; SVG é rasterizado e animações são tratadas como imagens estáticas.
  - Modo IA padrão para pessoas, produtos e objetos, com máscara suave aplicada na resolução original.
  - BiRefNet lite 512 (MIT), revisão fixa `962e67969ec6acec9c19fab76acee4f5e22e990c`, executado por ONNX Runtime Web em Web Worker, com WebGPU quando disponível e alternativa WASM.
  - No primeiro uso, baixa aproximadamente 192 MB de modelo do Hugging Face, além do runtime; cache local quando disponível. A imagem nunca é enviada ao serviço.
  - Progresso e cancelamento do processamento. O modo por cor continua disponível para logos e ícones.

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
