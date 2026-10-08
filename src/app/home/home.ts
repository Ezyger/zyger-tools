import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tool } from '../shared/tool.model';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  public readonly tools: Tool[] = [
    {
      id: 'json-to-excel',
      name: 'JSON → Excel',
      description: 'Converta arquivos JSON em planilhas Excel (.xlsx) diretamente no navegador.',
      route: '/tools/json-to-excel',
    },
    {
      id: 'json-formatter',
      name: 'Formatador de JSON',
      description: 'Formate, valide ou minifique um JSON diretamente no navegador.',
      route: '/tools/json-formatter',
    },
    {
      id: 'qrcode-generator',
      name: 'Gerador de QR Code',
      description: 'Gere QR Codes a partir de texto ou URL, individualmente ou em lote.',
      route: '/tools/qrcode-generator',
    },
    {
      id: 'barcode-generator',
      name: 'Gerador de Código de Barras',
      description: 'Gere códigos de barras GS1-128 e outros formatos, individualmente ou em lote.',
      route: '/tools/barcode-generator',
    },
  ];
}
