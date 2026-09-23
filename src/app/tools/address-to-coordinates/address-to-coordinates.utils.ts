export interface AddressInput {
  city?: string;
  complement?: string;
  neighborhood?: string;
  number?: string;
  postalCode?: string;
  state?: string;
  street?: string;
}

export type Coordinates = {
  latitude: string;
  longitude: string;
};

export interface NominatimResult {
  lat: string;
  lon: string;
}

/**
 * Faz o parse do texto colado e valida que é um objeto de endereço.
 * @param text O texto JSON a ser parseado.
 * @returns O objeto de endereço.
 * @throws Erro se o JSON for inválido ou não representar um objeto de endereço.
 */
export function parseAddressInput(text: string): AddressInput {
  if (text.trim() === '') {
    throw new Error('Invalid JSON.');
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON.');
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid JSON.');
  }
  return data as AddressInput;
}

/**
 * Monta a string de busca a partir dos campos preenchidos do endereço, assumindo Brasil como país.
 * @param address O objeto de endereço.
 * @returns A string de busca para o geocoding.
 * @throws Erro se não houver campos utilizáveis no endereço.
 */
export function buildAddressQuery(address: AddressInput): string {
  // Bases de CEP (Correios) às vezes incluem um sufixo de faixa (ex.: "- de 3020 ao fim - lado par"),
  // que não é um nome de rua e impede o geocoding de encontrar o endereço.
  const street = address.street?.split(' - ')[0]?.trim();
  const parts = [street, address.number, address.neighborhood, address.city, address.state, address.postalCode].filter(
    (part): part is string => !!part && part.trim() !== '',
  );

  if (parts.length === 0) {
    throw new Error('Address not found.');
  }

  return [...parts, 'Brazil'].join(', ');
}

/**
 * Mapeia a resposta do Nominatim para o formato de coordenadas usado pela ferramenta.
 * @param results O array de resultados do Nominatim.
 * @returns Um objeto com latitude e longitude.
 * @throws Erro se não houver resultados.
 */
export function mapGeocodingResponse(results: NominatimResult[]): Coordinates {
  const [first] = results;
  if (!first) {
    throw new Error('Address not found.');
  }
  return {
    latitude: first.lat,
    longitude: first.lon,
  };
}
