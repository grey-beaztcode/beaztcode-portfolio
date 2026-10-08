// Generates PNG icons (no dependencies). Usage: node tools-gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const png = (w, h, rgba) => {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
};
const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy); t = Math.max(0, Math.min(1, t)); return Math.hypot(px - (ax + t * dx), py - (ay + t * dy)); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const A = hex("#2ee6c5"), B = hex("#8b5cf6"), C = hex("#ffb454"), BG = hex("#07090f");
const chevrons = [[26, 18, 12, 32], [12, 32, 26, 46], [38, 18, 52, 32], [52, 32, 38, 46]];
const slash = [35, 14, 29, 50];

function render(size, { maskable }) {
  const out = Buffer.alloc(size * size * 4), SS = 3;
  const glyph = maskable ? 0.5 : 0.72;            // glyph scale (maskable keeps the safe zone)
  const radius = maskable ? 0 : size * 0.22;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const px = x + (sx + .5) / SS, py = y + (sy + .5) / SS;
      // rounded square mask
      let inside = true;
      if (radius) { const cx = Math.min(Math.max(px, radius), size - radius), cy = Math.min(Math.max(py, radius), size - radius); inside = Math.hypot(px - cx, py - cy) <= radius; }
      if (!inside) continue;
      // map to 64-unit glyph space
      const u = ((px / size - .5) / glyph + .5) * 64, v = ((py / size - .5) / glyph + .5) * 64;
      let col = BG;
      const dC = Math.min(...chevrons.map((s) => segDist(u, v, ...s)));
      const dS = segDist(u, v, ...slash);
      if (dS <= 2.6) col = C;
      else if (dC <= 3) { const t = Math.min(1, Math.max(0, (u + v - 20) / 70)); col = A.map((c, i) => c + (B[i] - c) * t); }
      r += col[0]; g += col[1]; b += col[2]; a += 255;
    }
    const n = SS * SS, i = (y * size + x) * 4;
    out[i] = r / (a / 255 || 1); out[i + 1] = g / (a / 255 || 1); out[i + 2] = b / (a / 255 || 1); out[i + 3] = a / n;
  }
  return png(size, size, out);
}
writeFileSync("assets/icons/icon-192.png", render(192, { maskable: false }));
writeFileSync("assets/icons/icon-512.png", render(512, { maskable: false }));
writeFileSync("assets/icons/maskable-512.png", render(512, { maskable: true }));
writeFileSync("assets/icons/apple-touch-icon.png", render(180, { maskable: true }));
console.log("icons ok");
