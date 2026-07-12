/**
 * Axis-native fortune pools — JSON data + thin export.
 * Merge new batches: npm run fortune:merge-batch -- --axis=money
 */
import moneyPool from './fortune-pools/fortune-money.pool.json' with { type: 'json' };
import healthPool from './fortune-pools/fortune-health.pool.json' with { type: 'json' };

export const FORTUNE_MONEY_RESULTS = moneyPool;
export const FORTUNE_HEALTH_RESULTS = healthPool;
