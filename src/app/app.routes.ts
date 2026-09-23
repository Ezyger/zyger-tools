import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./home/home').then((m) => m.Home) },
  {
    path: 'tools/json-to-excel',
    loadComponent: () => import('./tools/json-to-excel/json-to-excel').then((m) => m.JsonToExcel),
  },
  { path: '**', redirectTo: '' },
];
