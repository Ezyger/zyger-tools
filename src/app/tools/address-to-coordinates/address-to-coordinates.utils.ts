
/**
 * Representa os campos de entrada de um endereço.
 */
export interface AddressInput {
  city?: string;
  complement?: string;
  neighborhood?: string;
  number?: string | number;
  postalCode?: string | number;
  state?: string;
  street?: string;
}

/**
 * Representa as coordenadas geográficas de um endereço.
 */
export interface Coordinates {
  latitude: string;
  longitude: string;
}

/**
 * Resultado retornado pelo Nominatim para um endereço geocodificado.
 */
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
 * Normaliza um valor de campo de endereço (string, número ou vazio) para uma string sem espaços nas pontas.
 * @param value O valor bruto do campo, que pode vir como string, número, nulo ou indefinido.
 * @returns A string normalizada, ou undefined se o valor for vazio/ausente.
 */
function normalizeField(value: string | number | undefined | null): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const text = String(value).trim();
  return text === '' ? undefined : text;
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
  const street = normalizeField(address.street)?.split(' - ')[0]?.trim();
  const parts = [
    street,
    normalizeField(address.number),
    normalizeField(address.neighborhood),
    normalizeField(address.city),
    normalizeField(address.state),
    normalizeField(address.postalCode),
  ].filter((part): part is string => !!part);

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
