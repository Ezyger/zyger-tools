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
  ];
}
