// Verifies the hero carousel never puts a drawn card at or past the CSS camera plane.
// A card at z >= perspective projects to a near-infinite size; WebKit builds a compositing
// surface for it and iOS can run out of GPU memory and panic. Run: node tools/carousel-check.mjs
import { geometry } from "../docs/assets/carousel.js";

// render() skips cards past +-90deg, where z = -r*cos(theta) + zoff <= zoff (cos >= 0).
const maxDrawnZ = (g) => g.zoff;

const WIDTHS = [320, 375, 390, 430, 768, 1200, 1920];
let bad = 0;

for (const w of WIDTHS) {
  const g = geometry(w);
  const z = maxDrawnZ(g);
  const ok = z < g.persp;
  if (!ok) bad++;
  console.log(
    `${String(w).padStart(5)}px  max z ${z.toFixed(1).padStart(7)}  ` +
    `perspective ${g.persp.toFixed(1).padStart(7)}  ` +
    `z/persp ${(z / g.persp).toFixed(2)}  ${ok ? "ok" : "FAIL"}`
  );
}

// Sweep every width in between too, not just the listed ones.
for (let w = 200; w <= 2560; w++) {
  const g = geometry(w);
  if (!(maxDrawnZ(g) < 0.7 * g.persp + 1e-9)) {
    console.log(`FAIL at ${w}px: z ${maxDrawnZ(g).toFixed(1)} vs 0.7*persp ${(0.7 * g.persp).toFixed(1)}`);
    bad++;
  }
}

console.log(bad ? `\n${bad} failing width(s)` : "\nall widths 200-2560: max drawn z < 0.7 x perspective");
process.exit(bad ? 1 : 0);
