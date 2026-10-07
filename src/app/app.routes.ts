import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./home/home').then((m) => m.Home) },
  {
    path: 'tools/json-to-excel',
    loadComponent: () => import('./tools/json-to-excel/json-to-excel').then((m) => m.JsonToExcel),
  },
  {
    path: 'tools/address-to-coordinates',
    loadComponent: () => import('./tools/address-to-coordinates/address-to-coordinates').then((m) => m.AddressToCoordinates),
  },
  {
    path: 'tools/json-formatter',
    loadComponent: () => import('./tools/json-formatter/json-formatter').then((m) => m.JsonFormatter),
  },
  {
    path: 'tools/qrcode-generator',
    loadComponent: () => import('./tools/qrcode-generator/qrcode-generator').then((m) => m.QrcodeGenerator),
  },
  {
    path: 'tools/barcode-generator',
    loadComponent: () => import('./tools/barcode-generator/barcode-generator').then((m) => m.BarcodeGenerator),
  },
  { path: '**', redirectTo: '' },
];
