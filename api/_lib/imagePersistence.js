import fs from 'fs';
import path from 'path';
import { IMAGES_DIR } from './saveQuizImage.js';

/** True only when images can be written to git-tracked public/images (local dev / scripts). */
export function canPersistQuizImages() {
  if (process.env.VERCEL === '1') return false;
  try {
    if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
    const probe = path.join(IMAGES_DIR, '.write_probe');
    fs.writeFileSync(probe, '1');
    fs.unlinkSync(probe);
    return true;
  } catch {
    return false;
  }
}
