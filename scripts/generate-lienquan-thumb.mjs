#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { composeLienquanThumbImage } from '../api/_lib/composeOgImage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, '../public/images/lienquan_hub.webp');

const buf = await composeLienquanThumbImage();
fs.writeFileSync(out, buf);
console.log(`Wrote ${out} (${buf.length} bytes)`);
