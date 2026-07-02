#!/usr/bin/env bash
#
# judge_smoke.sh — one-command smoke test for judges.
#
# Exercises the local backend (offline mode, no secrets required) end-to-end,
# then pings the live Alibaba Cloud proof endpoint. Zero configuration needed:
# offline sample overlays are bundled.
#
# Usage:
#   ./scripts/judge_smoke.sh                 # assumes backend on :8000
#   BASE=http://localhost:8000 ./scripts/judge_smoke.sh
#   ALIBABA=http://8.222.191.152 ./scripts/judge_smoke.sh
#
# To start the local backend first:
#   cd backend && pip install -r requirements.txt && uvicorn main:app --port 8000
set -uo pipefail

BASE="${BASE:-http://localhost:8000}"
ALIBABA="${ALIBABA:-http://8.222.191.152}"
TICKER="${TICKER:-MA}"
PASS=0; FAIL=0

jqget() { command -v jq >/dev/null 2>&1 && jq -r "$1" || cat; }

check() { # name url jq-filter expected-substring
  local name="$1" url="$2" filt="$3" want="$4"
  local out; out=$(curl -sS -m 30 "$url" 2>/dev/null | jqget "$filt" 2>/dev/null)
  if printf '%s' "$out" | grep -qi "$want"; then
    printf "  PASS  %-34s %s\n" "$name" "$out"; PASS=$((PASS+1))
  else
    printf "  FAIL  %-34s got=[%s] want~[%s]\n" "$name" "$out" "$want"; FAIL=$((FAIL+1))
  fi
}

echo "== Local backend (offline mode, no secrets) @ $BASE =="
check "health"            "$BASE/health"                       '.status'          "ok"
check "qwen overlay"      "$BASE/api/overlay/qwen/$TICKER"     '.status'          "SAMPLE"
check "deepseek overlay"  "$BASE/api/overlay/deepseek/$TICKER" '.status'          "SAMPLE"
check "comparison"        "$BASE/api/comparison/$TICKER"       '.agreement_level' "."
check "alibaba proof code" "$BASE/api/alibaba/proof"           '.cloud_provider'  "Alibaba"

echo
echo "== Live Alibaba Cloud ECS proof @ $ALIBABA =="
check "alibaba live proof" "$ALIBABA/api/proof/alibaba-cloud"  '.runtime'         "Alibaba"

echo
echo "-------------------------------------------"
echo "  PASS=$PASS  FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && { echo "  ALL GREEN"; exit 0; } || { echo "  SOME CHECKS FAILED"; exit 1; }
