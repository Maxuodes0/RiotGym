#!/usr/bin/env bash
set -euo pipefail

if [ -d "/Applications/Xcode.app/Contents/Developer" ]; then
  export DEVELOPER_DIR="/Applications/Xcode.app/Contents/Developer"
elif [ -d "$HOME/Desktop/Dev Tools/Xcode.app/Contents/Developer" ]; then
  export DEVELOPER_DIR="$HOME/Desktop/Dev Tools/Xcode.app/Contents/Developer"
fi

if command -v npm >/dev/null 2>&1; then
  npm run ios
elif command -v node >/dev/null 2>&1 && [ -f "../.tools/npm/bin/npm-cli.js" ]; then
  node ../.tools/npm/bin/npm-cli.js run ios
else
  echo "Node.js and npm are required. Install Node.js, then run: npm install && npm run ios"
  exit 1
fi
