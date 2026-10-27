import { applyAlphaMask, logitsToMask, normalizeAiInput } from './background-remover-ai.utils';

describe('background remover AI preprocessing', () => {
  it('normalizes RGB into channel-first tensors and composites transparent input on white', () => {
    const result = normalizeAiInput(new Uint8ClampedArray([255, 0, 0, 255, 0, 0, 0, 0]));
    expect(result.length).toBe(6);
    expect(result[0]).toBeCloseTo((1 - 0.485) / 0.229, 5);
    expect(result[1]).toBeCloseTo(result[0], 5);
    expect(result[2]).toBeCloseTo(-0.456 / 0.224, 5);
    expect(result[3]).toBeCloseTo((1 - 0.456) / 0.224, 5);
    expect(result[4]).toBeCloseTo(-0.406 / 0.225, 5);
  });

  it('keeps soft mask values and handles very large logits', () => {
    expect(Array.from(logitsToMask(new Float32Array([-1000, 0, 1000])))).toEqual([0, 128, 255]);
  });

  it('preserves original RGB and multiplies existing alpha by the mask', () => {
    const source = new Uint8ClampedArray([10, 20, 30, 128, 40, 50, 60, 0]);
    const mask = new Uint8ClampedArray([128, 128, 128, 255, 255, 255, 255, 255]);
    expect(Array.from(applyAlphaMask(source, mask))).toEqual([10, 20, 30, 64, 40, 50, 60, 0]);
    expect(source[3]).toBe(128);
    expect(() => applyAlphaMask(source, new Uint8ClampedArray(4))).toThrowError();
  });
});
