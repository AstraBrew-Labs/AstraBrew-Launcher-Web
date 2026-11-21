import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

function pngSize(bytes) {
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

test('the branded PNG and conventional ICO supply square favicon sizes', () => {
  const png = readFileSync(new URL('../public/brand/favicon-96.png', import.meta.url));
  const ico = readFileSync(new URL('../public/favicon.ico', import.meta.url));
  expect(pngSize(png)).toEqual([96, 96]);
  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(4);
  for (const [i, size] of [16, 32, 48, 96].entries()) {
    const entry = 6 + i * 16;
    const offset = ico.readUInt32LE(entry + 12);
    const frame = ico.subarray(offset, offset + ico.readUInt32LE(entry + 8));
    expect([ico[entry], ico[entry + 1]]).toEqual([size, size]);
    expect(pngSize(frame)).toEqual([size, size]);
    if (size === 96) expect(frame.equals(png)).toBe(true);
  }
});
