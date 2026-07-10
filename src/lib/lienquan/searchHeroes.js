import { searchHeroesFromIndex } from '../../../shared/lienquan/searchLienquan.js';

/** @deprecated Prefer searchLienquan for hub search */
export function searchHeroes(query, limit = 8) {
  return searchHeroesFromIndex(query, limit);
}

export { searchLienquan, LQ_SEARCH_TYPE_LABELS } from '../../../shared/lienquan/searchLienquan.js';
