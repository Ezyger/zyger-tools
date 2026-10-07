import { parseBatchLines, sanitizeFileNamePart, toFriendlyError } from './code-image.util';

describe('parseBatchLines', () => {
  it('splits text into trimmed, non-empty lines', () => {
    expect(parseBatchLines('  abc \n\n def \n  \nghi')).toEqual(['abc', 'def', 'ghi']);
  });

  it('returns an empty array for blank input', () => {
    expect(parseBatchLines('   \n  \n')).toEqual([]);
  });
});

describe('sanitizeFileNamePart', () => {
  it('replaces unsafe characters with underscores', () => {
    expect(sanitizeFileNamePart('(01)078912345(17)260101')).toBe('_01_078912345_17_260101');
  });

  it('falls back to a default name when the result is empty', () => {
    expect(sanitizeFileNamePart('   ')).toBe('codigo');
  });

  it('truncates very long values', () => {
    expect(sanitizeFileNamePart('a'.repeat(100)).length).toBe(60);
  });
});

describe('toFriendlyError', () => {
  it('returns string errors as-is', () => {
    expect(toFriendlyError('algo deu errado')).toBe('algo deu errado');
  });

  it('returns the message of an Error instance', () => {
    expect(toFriendlyError(new Error('falhou'))).toBe('falhou');
  });

  it('returns a default message for unknown error shapes', () => {
    expect(toFriendlyError({})).toBe('Não foi possível gerar o código com os dados informados.');
  });
});
