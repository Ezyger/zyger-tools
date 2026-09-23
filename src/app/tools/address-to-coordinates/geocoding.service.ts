import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NominatimResult } from './address-to-coordinates.utils';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private readonly http = inject(HttpClient);

  /**
   * Busca coordenadas para o endereço informado usando o Nominatim (OpenStreetMap).
   * @param query O endereço a ser geocodificado.
   * @returns Um Observable que emite um array de resultados do Nominatim.
   */
  public search(query: string): Observable<NominatimResult[]> {
    const params = { q: query, format: 'json', limit: '1' };
    return this.http.get<NominatimResult[]>(NOMINATIM_URL, { params });
  }
}
