/** Repo root — import from scripts/* subfolders as `../_root.mjs` */
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.join(__dirname, '..');
