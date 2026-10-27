import { removeBackground } from './background-remover.utils';

describe('removeBackground', () => {
  const white = [255, 255, 255, 255];
  const black = [0, 0, 0, 255];

  it('preserves enclosed regions when removing only the connected background', () => {
    const source = new Uint8ClampedArray([
      ...white,
      ...white,
      ...white,
      ...white,
      ...white,
      ...white,
      ...black,
      ...black,
      ...black,
      ...white,
      ...white,
      ...black,
      ...white,
      ...black,
      ...white,
      ...white,
      ...black,
      ...black,
      ...black,
      ...white,
      ...white,
      ...white,
      ...white,
      ...white,
      ...white,
    ]);
    const result = removeBackground(source, 5, 5, white, 0, true);
    expect(result[3]).toBe(0);
    expect(result[12 * 4 + 3]).toBe(255);
    expect(result[6 * 4 + 3]).toBe(255);
    expect(source[3]).toBe(255);
    expect(removeBackground(source, 5, 5, white, 0, false)[12 * 4 + 3]).toBe(0);
  });

  it('honors tolerance and preserves existing partial transparency', () => {
    const source = new Uint8ClampedArray([250, 250, 250, 255, 0, 0, 0, 128]);
    expect(removeBackground(source, 2, 1, white, 4, true)[3]).toBe(255);
    const result = removeBackground(source, 2, 1, white, 5, true);
    expect(result[3]).toBe(0);
    expect(result[7]).toBe(128);
  });

  it('crosses transparent border pixels to reach the background', () => {
    const source = new Uint8ClampedArray([0, 0, 0, 0, ...white, ...black]);
    expect(removeBackground(source, 3, 1, white, 0, true)[7]).toBe(0);
  });
});
