/**
 * Removes matching pixels connected to an edge, or all matching pixels when requested.
 * @param source The source pixel data in RGBA format.
 * @param width The width of the image in pixels.
 * @param height The height of the image in pixels.
 * @param color The RGBA color to match for removal.
 * @param tolerance The tolerance for color matching (0-255).
 * @param connectedOnly Whether to remove only pixels connected to the edge.
 * @returns A new Uint8ClampedArray with the background removed.
 * @throws Error if the input parameters are invalid.
 */
export function removeBackground(
  source: Uint8ClampedArray,
  width: number,
  height: number,
  color: readonly number[],
  tolerance: number,
  connectedOnly: boolean,
): Uint8ClampedArray {
  const output = new Uint8ClampedArray(source);
  const count = width * height;
  const matches = (pixel: number): boolean => {
    const offset = pixel * 4;
    return (
      source[offset + 3] === 0 ||
      Math.max(
        Math.abs(source[offset] - color[0]),
        Math.abs(source[offset + 1] - color[1]),
        Math.abs(source[offset + 2] - color[2]),
      ) <= tolerance
    );
  };
  if (!connectedOnly) {
    for (let pixel = 0; pixel < count; pixel++) {
      if (matches(pixel)) output[pixel * 4 + 3] = 0;
    }
    return output;
  }
  const visited = new Uint8Array(count);
  const queue = new Uint32Array(count);
  let head = 0;
  let tail = 0;
  const visit = (pixel: number): void => {
    if (visited[pixel]) return;
    visited[pixel] = 1;
    if (matches(pixel)) queue[tail++] = pixel;
  };
  for (let x = 0; x < width; x++) {
    visit(x);
    visit((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    visit(y * width);
    visit(y * width + width - 1);
  }
  while (head < tail) {
    const pixel = queue[head++];
    output[pixel * 4 + 3] = 0;
    if (pixel % width > 0) visit(pixel - 1);
    if (pixel % width < width - 1) visit(pixel + 1);
    if (pixel >= width) visit(pixel - width);
    if (pixel + width < count) visit(pixel + width);
  }
  return output;
}
