#!/usr/bin/env bash
# 퀴즈 1개씩 천천히 이미지 생성 (cover + 결과 8장)
# Usage: npm run images:backfill:all
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DELAY="${BACKFILL_DELAY:-4000}"
PAUSE="${BACKFILL_PAUSE:-8000}"
MAX="${BACKFILL_MAX:-25}"
# Default: fill missing/placeholder only. Set BACKFILL_FORCE=--force to re-gen backfill_* once per quiz.
# Set BACKFILL_RESULTS_ONLY=--results-only to regenerate answer images only (works with --force).
FORCE="${BACKFILL_FORCE:-}"
RESULTS_ONLY="${BACKFILL_RESULTS_ONLY:-}"
n=0
while [ "$n" -lt "$MAX" ]; do
  echo ""
  echo "========== Batch $((n + 1)) / $MAX =========="
  OUT=$(npm run images:backfill -- --max-quizzes=1 --delay="$DELAY" --skip-questions $FORCE $RESULTS_ONLY 2>&1) || true
  echo "$OUT"
  if echo "$OUT" | grep -q "Done: 0 images, 0 quiz"; then
    echo "✅ All quizzes have images."
    break
  fi
  if echo "$OUT" | grep -q "Done: 0 images" && echo "$OUT" | grep -q "0 quiz(es) processed"; then
    echo "✅ Nothing left to backfill."
    break
  fi
  if echo "$OUT" | grep -q "Done: 0 images" && echo "$OUT" | grep -E -q "[0-9]+ already OK"; then
    echo "✅ Nothing left to backfill."
    break
  fi
  n=$((n + 1))
  echo "⏳ Pause ${PAUSE}ms..."
  sleep $((PAUSE / 1000))
done
