import { flattenObject, getColumns, parseJson, toRows } from './json-to-excel.utils';

describe('parseJson', () => {
  it('parses valid JSON text', () => {
    expect(parseJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('throws a friendly error for invalid JSON syntax', () => {
    expect(() => parseJson('{a:1}')).toThrowError('O JSON informado possui um erro de sintaxe.');
  });

  it('throws a friendly error for empty text', () => {
    expect(() => parseJson('   ')).toThrowError('O conteúdo informado está vazio.');
  });
});

describe('toRows', () => {
  it('wraps a single object into a one-element array', () => {
    expect(toRows({ name: 'Eduardo' })).toEqual([{ name: 'Eduardo' }]);
  });

  it('returns an array of objects unchanged', () => {
    const data = [{ name: 'Eduardo' }, { name: 'João' }];
    expect(toRows(data)).toEqual(data);
  });

  it('throws for an empty array', () => {
    expect(() => toRows([])).toThrowError('O array informado está vazio.');
  });

  it('throws for an array of non-objects', () => {
    expect(() => toRows([1, 2, 3])).toThrowError(
      'O JSON deve ser um array de objetos ou um único objeto.',
    );
  });

  it('throws for unsupported primitive structures', () => {
    expect(() => toRows('hello')).toThrowError(
      'O JSON deve ser um array de objetos ou um único objeto.',
    );
  });
});

describe('flattenObject', () => {
  it('flattens nested objects using dot notation', () => {
    const input = {
      pointId: 73,
      delivery: { barcode: 'ABC123', status: 'delivered' },
      customer: { city: 'Santa Helena', state: 'PR' },
    };

    expect(flattenObject(input)).toEqual({
      pointId: 73,
      'delivery.barcode': 'ABC123',
      'delivery.status': 'delivered',
      'customer.city': 'Santa Helena',
      'customer.state': 'PR',
    });
  });

  it('converts simple arrays into a comma-separated string', () => {
    expect(flattenObject({ tags: ['angular', 'typescript', 'node'] })).toEqual({
      tags: 'angular, typescript, node',
    });
  });

  it('stringifies arrays of objects', () => {
    expect(flattenObject({ items: [{ id: 1 }, { id: 2 }] })).toEqual({
      items: '[{"id":1},{"id":2}]',
    });
  });
});

describe('getColumns', () => {
  it('collects unique columns preserving first-seen order', () => {
    const rows = [
      { a: 1, b: 2 },
      { b: 3, c: 4 },
    ];
    expect(getColumns(rows)).toEqual(['a', 'b', 'c']);
  });
});
