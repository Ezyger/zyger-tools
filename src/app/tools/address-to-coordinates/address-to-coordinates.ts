import { Component, computed, inject, signal } from '@angular/core';
import { GeocodingService } from './geocoding.service';
import { buildAddressQuery, Coordinates, mapGeocodingResponse, parseAddressInput } from './address-to-coordinates.utils';

@Component({
  selector: 'app-address-to-coordinates',
  imports: [],
  templateUrl: './address-to-coordinates.html',
  styleUrl: './address-to-coordinates.scss',
})
export class AddressToCoordinates {
  private readonly geocodingService = inject(GeocodingService);

  public readonly errorMessage = signal<string | null>(null);
  public readonly result = signal<Coordinates | null>(null);
  public readonly isLoading = signal(false);
  public readonly copied = signal(false);

  public readonly resultJson = computed(() => {
    const current = this.result();
    return current ? JSON.stringify(current, null, 2) : '';
  });

  /**
   * Busca as coordenadas correspondentes ao endereço colado no textarea.
   * @param textarea O elemento textarea contendo o JSON do endereço.
   */
  public getCoordinates(textarea: HTMLTextAreaElement): void {
    this.errorMessage.set(null);
    this.result.set(null);
    try {
      const address = parseAddressInput(textarea.value);
      const query = buildAddressQuery(address);
      this.search(query);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : 'Invalid JSON.');
    }
  }

  /**
   * Copia o resultado exibido para a área de transferência.
   */
  public copyResult(): void {
    const json = this.resultJson();
    if (!json) return;
    void navigator.clipboard.writeText(json);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }

  /**
   * Busca as coordenadas correspondentes à query fornecida.
   * @param query A string de busca para o geocoding.
   */
  private search(query: string): void {
    this.isLoading.set(true);
    this.geocodingService.search(query).subscribe({
      next: (results) => {
        this.isLoading.set(false);
        try {
          this.result.set(mapGeocodingResponse(results));
        } catch (error) {
          this.errorMessage.set(error instanceof Error ? error.message : 'Address not found.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Unable to get coordinates. Try again.');
      },
    });
  }
}
