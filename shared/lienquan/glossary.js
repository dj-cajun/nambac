/**
 * In-game item / term glossary (VI ↔ KO) for UI & icon mapping.
 * Source text: glossary-items.txt · data: glossary-items.json
 */
import glossary from './glossary-items.json' with { type: 'json' };

export const LQ_GLOSSARY = glossary;

const FLAT = Object.assign(
  {},
  glossary.physical,
  glossary.magic,
  glossary.defense,
  glossary.boots_support,
  glossary.lanes,
  glossary.terms,
);

export function translateItem(viName) {
  return FLAT[viName] || null;
}

export function allItemEntries() {
  return Object.entries(FLAT).map(([vi, ko]) => ({ vi, ko }));
}
