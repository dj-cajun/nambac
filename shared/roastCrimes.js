/** @deprecated Use roastData.js */
export {
  ROAST_TRAITS,
  getTraitById as getCrimeById,
  ROAST_TRAITS as ROAST_CRIMES,
} from './roastData.js';

import { getTraitById } from './roastData.js';

export function buildRoastCardText(name, crime) {
  const who = (name || 'Bạn thân').trim().slice(0, 15);
  const trait = crime?.title ? crime : getTraitById(crime?.id);
  return {
    headline: `${who} — Blacklist Card 💳`,
    body: trait.description,
    crimeLabel: trait.title,
  };
}
