export const AI_INPUT_SIZE = 512;
export const AI_MODEL_URL =
  'https://huggingface.co/studioludens/birefnet-lite-512/resolve/' + '962e67969ec6acec9c19fab76acee4f5e22e990c/onnx/model.onnx';

export type AiWorkerResponse =
  | { type: 'progress'; message: string }
  | { type: 'result'; mask: Uint8ClampedArray }
  | { type: 'error'; message: string; retryWithCpu?: boolean };

/**
 * Converte RGB em NCHW com a normalização ImageNet exigida pelo BiRefNet.
 */
export function normalizeAiInput(rgba: Uint8ClampedArray): Float32Array {
  const count = rgba.length / 4;
  const tensor = new Float32Array(count * 3);
  const mean = [0.485, 0.456, 0.406];
  const std = [0.229, 0.224, 0.225];
  for (let pixel = 0; pixel < count; pixel++) {
    const alpha = rgba[pixel * 4 + 3] / 255;
    for (let channel = 0; channel < 3; channel++) {
      // Compõe pixels transparentes sobre branco apenas na entrada do modelo.
      const value = (rgba[pixel * 4 + channel] * alpha + 255 * (1 - alpha)) / 255;
      tensor[channel * count + pixel] = (value - mean[channel]) / std[channel];
    }
  }
  return tensor;
}

/**
 * Mantém os valores intermediários da máscara para preservar cabelos e bordas suaves.
 */
export function logitsToMask(logits: Float32Array): Uint8ClampedArray {
  return Uint8ClampedArray.from(logits, (value) => 255 / (1 + Math.exp(-value)));
}

/**
 * Aplica a máscara sem recuperar pixels que já eram transparentes no original.
 */
export function applyAlphaMask(source: Uint8ClampedArray, maskRgba: Uint8ClampedArray): Uint8ClampedArray {
  if (source.length !== maskRgba.length) throw new Error('A máscara deve ter as mesmas dimensões da imagem.');
  const pixels = new Uint8ClampedArray(source);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    pixels[offset + 3] = (source[offset + 3] * maskRgba[offset]) / 255;
  }
  return pixels;
}
