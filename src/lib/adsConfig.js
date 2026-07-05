const PLACEHOLDER_SLOTS = new Set(['1234567890', '0987654321', '0000000000']);

function resolveSlot(raw) {
  const slot = String(raw || '').trim();
  if (!slot || PLACEHOLDER_SLOTS.has(slot)) return '';
  return slot;
}

export const AD_SLOTS = {
  home: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_HOME),
  quiz: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_QUIZ),
  result1: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_RESULT_1),
  result2: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_RESULT_2),
};
