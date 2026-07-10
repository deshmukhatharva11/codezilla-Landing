const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const INPUT_DIR  = path.join(__dirname, '..', 'public', 'frames');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'frames-mobile');
const TOTAL      = 212;
const TARGET_W   = 1080;
const TARGET_H   = 608;   // maintains ~16:9 aspect, covers portrait mobile screens
const QUALITY    = 88;    // WebP quality 88 → sharp & small
const CONCURRENCY = 8;

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

let done = 0;
let idx  = 0;
let active = 0;

function pad(n) { return String(n).padStart(3, '0'); }

function next() {
  while (active < CONCURRENCY && idx < TOTAL) {
    const i = idx++;
    active++;
    const inFile  = path.join(INPUT_DIR,  `ezgif-frame-${pad(i + 1)}.jpg`);
    const outFile = path.join(OUTPUT_DIR, `frame-${pad(i + 1)}.webp`);

    sharp(inFile)
      .resize(TARGET_W, TARGET_H, {
        fit:      'cover',       // auto-crop to fill 1080×608
        position: 'centre',
        kernel:   sharp.kernel.lanczos3,
      })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(outFile)
      .then(() => {
        done++;
        active--;
        if (done % 20 === 0 || done === TOTAL) {
          process.stdout.write(`\r  ${done}/${TOTAL} frames converted`);
        }
        if (done === TOTAL) {
          console.log('\n✓ Done! Mobile WebP frames ready in public/frames-mobile/');
        } else {
          next();
        }
      })
      .catch(err => {
        console.error(`Error on frame ${i + 1}:`, err.message);
        done++; active--;
        next();
      });
  }
}

console.log(`Converting ${TOTAL} frames → ${TARGET_W}×${TARGET_H} WebP (q${QUALITY})...`);
next();
