import { buildAddressQuery, mapGeocodingResponse, parseAddressInput } from './address-to-coordinates.utils';

describe('parseAddressInput', () => {
  it('parses a valid address object', () => {
    expect(parseAddressInput('{"city":"Manaus"}')).toEqual({ city: 'Manaus' });
  });

  it('throws for empty text', () => {
    expect(() => parseAddressInput('   ')).toThrowError('Invalid JSON.');
  });

  it('throws for invalid JSON syntax', () => {
    expect(() => parseAddressInput('{city:1}')).toThrowError('Invalid JSON.');
  });

  it('throws for a JSON array', () => {
    expect(() => parseAddressInput('[1,2,3]')).toThrowError('Invalid JSON.');
  });

  it('throws for a JSON primitive', () => {
    expect(() => parseAddressInput('"Manaus"')).toThrowError('Invalid JSON.');
  });
});

describe('buildAddressQuery', () => {
  it('builds the query string from the filled fields, appending Brazil', () => {
    const query = buildAddressQuery({
      city: 'Manaus',
      complement: '',
      neighborhood: 'Petrópolis',
      number: '200',
      postalCode: '69067520',
      state: 'AM',
      street: 'Rua Rio Nilo',
    });

    expect(query).toBe('Rua Rio Nilo, 200, Petrópolis, Manaus, AM, 69067520, Brazil');
  });

  it('ignores empty fields', () => {
    const query = buildAddressQuery({ city: 'Manaus', state: '', street: 'Rua Rio Nilo' });
    expect(query).toBe('Rua Rio Nilo, Manaus, Brazil');
  });

  it('never includes the complement field', () => {
    const query = buildAddressQuery({ city: 'Manaus', complement: 'Apto 101' });
    expect(query).not.toContain('Apto 101');
  });

  it('strips CEP database range descriptors from the street field', () => {
    const query = buildAddressQuery({
      city: 'Rio de Janeiro',
      number: '3140',
      state: 'RJ',
      street: 'Estrada da Barra da Tijuca - de 3020 ao fim - lado par',
    });

    expect(query).toBe('Estrada da Barra da Tijuca, 3140, Rio de Janeiro, RJ, Brazil');
  });

  it('throws when there are no usable fields', () => {
    expect(() => buildAddressQuery({ complement: 'Apto 101' })).toThrowError('Address not found.');
  });
});

describe('mapGeocodingResponse', () => {
  it('maps the first result to latitude/longitude strings', () => {
    const coordinates = mapGeocodingResponse([{ lat: '-3.10342', lon: '-60.01268' }]);
    expect(coordinates).toEqual({ latitude: '-3.10342', longitude: '-60.01268' });
  });

  it('throws when there are no results', () => {
    expect(() => mapGeocodingResponse([])).toThrowError('Address not found.');
  });
});
