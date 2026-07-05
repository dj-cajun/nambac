#!/usr/bin/env bash
# 퀴즈 1개씩 천천히 이미지 생성 (cover + 결과 8장)
# Usage: npm run images:backfill:all
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
DELAY="${BACKFILL_DELAY:-4000}"
PAUSE="${BACKFILL_PAUSE:-8000}"
MAX="${BACKFILL_MAX:-25}"
FORCE="${BACKFILL_FORCE:---force}"
n=0
while [ "$n" -lt "$MAX" ]; do
  echo ""
  echo "========== Batch $((n + 1)) / $MAX =========="
  OUT=$(npm run images:backfill -- --max-quizzes=1 --delay="$DELAY" $FORCE 2>&1) || true
  echo "$OUT"
  if echo "$OUT" | grep -q "0 images, 0 quiz"; then
    echo "✅ All quizzes have images."
    break
  fi
  if echo "$OUT" | grep -q "Done: 0 images" && echo "$OUT" | grep -q "0 quiz(es) processed"; then
    echo "✅ Nothing left to backfill."
    break
  fi
  if echo "$OUT" | grep -q "Done: 0 images" && echo "$OUT" | grep -q "already OK"; then
    echo "✅ Nothing left to backfill."
    break
  fi
  n=$((n + 1))
  echo "⏳ Pause ${PAUSE}ms..."
  sleep $((PAUSE / 1000))
done
