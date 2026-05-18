#!/usr/bin/env bash
# ============================================================
# validate.sh — Pre-push integrity check for jfcarpio.com
# Run from repo root:  bash scripts/validate.sh
# Exits non-zero if any check fails. Safe to run anytime.
# ============================================================

set -e

RED=$'\033[31m'
GREEN=$'\033[32m'
YELLOW=$'\033[33m'
RESET=$'\033[0m'

fail=0
ok=0

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Repo: $ROOT"
echo ""

# ---- 1. Find actively-maintained index.html files ----
# Scope: las7formas/ + root index.html. Other subdirectories have legacy
# browser-save artifacts JFC will clean separately; we don't gate on them.
FILES=()
[ -f "./index.html" ] && FILES+=("./index.html")
[ -f "./las7formas/index.html" ] && FILES+=("./las7formas/index.html")
[ -f "./visorantiquiebra/index.html" ] && FILES+=("./visorantiquiebra/index.html")

# Detect a working python interpreter (try invocation, not just presence
# — Windows ships a stub at python.exe that errors on launch).
PY=""
for c in python3 py python; do
  if "$c" --version >/dev/null 2>&1; then PY="$c"; break; fi
done
if [ -z "$PY" ]; then
  echo "${YELLOW}WARN: python not found; JSON-LD validation will be skipped (run on Linux/Mac or install python to enable).${RESET}"
fi

if [ "${#FILES[@]}" -eq 0 ]; then
  echo "${YELLOW}No index.html files found.${RESET}"
  exit 0
fi

echo "Validating ${#FILES[@]} index.html files..."
echo ""

# ---- 2. DOCTYPE count = 1 (browser-save catastrophe detector) ----
echo "[1/4] Checking DOCTYPE count..."
for f in "${FILES[@]}"; do
  count=$(grep -c '<!DOCTYPE' "$f" || true)
  if [ "$count" -ne 1 ]; then
    echo "  ${RED}FAIL${RESET}: $f has $count DOCTYPE (must be 1)"
    fail=$((fail+1))
  else
    ok=$((ok+1))
  fi
done

# ---- 3. No URL-encoded directory paths (browser-save signature) ----
echo "[2/4] Checking for browser-save URL-encoded paths..."
for f in "${FILES[@]}"; do
  hits=$(grep -c 'Juan%20Fernando\|index_files/' "$f" || true)
  if [ "$hits" -ne 0 ]; then
    echo "  ${RED}FAIL${RESET}: $f has $hits URL-encoded path references"
    fail=$((fail+1))
  fi
done

# ---- 4. No chrome-extension:// references ----
echo "[3/4] Checking for chrome-extension references..."
for f in "${FILES[@]}"; do
  hits=$(grep -c 'chrome-extension://' "$f" || true)
  if [ "$hits" -ne 0 ]; then
    echo "  ${RED}FAIL${RESET}: $f has $hits chrome-extension references"
    fail=$((fail+1))
  fi
done

# ---- 5. JSON-LD blocks parse as valid JSON ----
echo "[4/4] Validating JSON-LD blocks..."
if [ -z "$PY" ]; then
  echo "  (skipped — no python)"
else
for f in "${FILES[@]}"; do
  "$PY" - "$f" <<'PYEOF'
import re, sys, json
path = sys.argv[1]
with open(path, encoding="utf-8") as fp:
    html = fp.read()
blocks = re.findall(
    r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    html,
    re.DOTALL | re.IGNORECASE,
)
errors = 0
for i, block in enumerate(blocks, 1):
    try:
        json.loads(block.strip())
    except json.JSONDecodeError as e:
        print(f"  FAIL: {path} block {i} — {e}")
        errors += 1
if errors:
    sys.exit(errors)
PYEOF
  rc=$?
  if [ "$rc" -ne 0 ]; then
    fail=$((fail+rc))
  fi
done
fi

echo ""
if [ "$fail" -eq 0 ]; then
  echo "${GREEN}All checks passed.${RESET} ($ok files clean)"
  exit 0
else
  echo "${RED}$fail check(s) failed.${RESET}"
  exit 1
fi
