import { formatJson, minifyJson, parseJsonText } from './json-formatter.utils';

describe('parseJsonText', () => {
  it('parses valid JSON text', () => {
    expect(parseJsonText('{"a":1}')).toEqual({ a: 1 });
  });

  it('throws a friendly error for invalid JSON syntax', () => {
    expect(() => parseJsonText('{a:1}')).toThrowError('O JSON informado possui um erro de sintaxe.');
  });

  it('throws a friendly error for empty text', () => {
    expect(() => parseJsonText('   ')).toThrowError('O conteúdo informado está vazio.');
  });
});

describe('formatJson', () => {
  it('formats with 2 spaces', () => {
    expect(formatJson('{"a":1,"b":2}', '2')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('formats with 4 spaces', () => {
    expect(formatJson('{"a":1}', '4')).toBe('{\n    "a": 1\n}');
  });

  it('formats with a tab', () => {
    expect(formatJson('{"a":1}', 'tab')).toBe('{\n\t"a": 1\n}');
  });

  it('throws for invalid JSON', () => {
    expect(() => formatJson('{a:1}', '2')).toThrowError('O JSON informado possui um erro de sintaxe.');
  });
});

describe('minifyJson', () => {
  it('removes unnecessary whitespace', () => {
    expect(minifyJson('{\n  "a": 1,\n  "b": [1, 2, 3]\n}')).toBe('{"a":1,"b":[1,2,3]}');
  });

  it('throws for invalid JSON', () => {
    expect(() => minifyJson('{a:1}')).toThrowError('O JSON informado possui um erro de sintaxe.');
  });
});
