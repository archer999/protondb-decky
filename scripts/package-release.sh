#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-$ROOT/release}"

if [[ ! -f "$ROOT/dist/index.js" ]]; then
  echo "Missing built frontend bundle: $ROOT/dist/index.js" >&2
  echo "Run pnpm build first." >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$DEST/dist"

cp "$ROOT/LICENSE" "$DEST/LICENSE"
cp "$ROOT/plugin.json" "$DEST/plugin.json"
cp "$ROOT/package.json" "$DEST/package.json"
cp "$ROOT/main.py" "$DEST/main.py"
cp "$ROOT/settings.py" "$DEST/settings.py"
cp "$ROOT/dist/index.js" "$DEST/dist/index.js"

find "$DEST" -type f \( -name '*.map' -o -name '*.tsbuildinfo' \) -delete
