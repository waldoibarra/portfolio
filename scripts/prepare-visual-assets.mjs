import { mkdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const [sourceDirectory, sharpModule] = process.argv.slice(2);
if (!sourceDirectory || !sharpModule) {
  throw new Error('Pass the image workspace and an installed Sharp module directory.');
}
const require = createRequire(import.meta.url);
const sharp = require(resolve(sharpModule));
const source = resolve(sourceDirectory);
const target = fileURLToPath(new URL('../public/images/', import.meta.url));
const personal = join(target, 'personal');
const worlds = join(target, 'worlds');
await mkdir(personal, { recursive: true });
await mkdir(worlds, { recursive: true });
const outputs = [];

async function saveWebp(pipeline, filename) {
  const info = await pipeline.webp({ quality: 82, effort: 6 }).toFile(filename);
  outputs.push({ file: filename.slice(target.length), width: info.width,
    height: info.height, bytes: info.size });
}

const archivedOutputs = join(source, 'archive/2026-11-14-earlier-rounds/outputs');
const librarySource = join(archivedOutputs, 'round-2/masters/04-portfolio.png');
const library = sharp(librarySource).rotate();
const { width, height } = await library.metadata();
// Preserve the subject and illustrated shelves while removing unused left-side space.
const cropWidth = Math.floor(width * .79 / 4) * 4;
const cropHeight = Math.min(height, cropWidth * 3 / 4);
const crop = { left: width - cropWidth, top: 0, width: cropWidth, height: cropHeight };
for (const size of [640, 960, 1600]) {
  await saveWebp(library.clone().extract(crop).resize(size, size * 3 / 4),
    join(personal, `library-${size}.webp`));
}
for (const size of [640, 960]) {
  await saveWebp(sharp(join(source, 'outputs/current-review/instagram.png'))
    .rotate().resize({ width: size }), join(personal, `river-${size}.webp`));
}
for (const name of ['workshop', 'observatory', 'garden', 'crossroads']) {
  for (const size of [320, 640, 1280]) {
    await saveWebp(sharp(join(archivedOutputs, `implementation/masters/${name}.png`))
      .rotate().resize(size, size * 3 / 4, { fit: 'cover' }),
    join(worlds, `${name}-${size}.webp`));
  }
}
const title = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <g fill="#fff5de" font-family="Georgia, serif">
    <text x="52" y="220" font-size="48">Waldo Ibarra</text>
    <text x="54" y="285" font-size="25">A personal library.</text>
  </g>
  <g fill="#d5ddd4" font-family="sans-serif" font-size="21">
    <text x="54" y="355">Software, curiosity,</text>
    <text x="54" y="389">and life beyond the screen.</text>
    <text x="54" y="540">waldo.love</text>
  </g>
</svg>`);
await sharp(librarySource).rotate().resize(1200, 630, { fit: 'cover', position: 'top' })
  .composite([{ input: title }]).jpeg({ quality: 86 }).toFile(join(target, 'social-preview.jpg'));
console.log(JSON.stringify(outputs, null, 2));
