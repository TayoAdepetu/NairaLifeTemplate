#!/usr/bin/env sh
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if command -v rg >/dev/null 2>&1; then
  if rg -n 'nl_dea_(sbx|prd)_' "$ROOT/src" --glob '!**/api/**' --glob '!**/.next/**' 2>/dev/null; then
    echo "DEA key pattern found in client source — use server env DEA_API_KEY only."
    exit 1
  fi
else
  echo "warn: ripgrep (rg) not installed; skipping DEA leak check"
fi
echo "OK: no DEA key literals in client source (static check)."
