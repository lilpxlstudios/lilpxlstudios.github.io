#!/usr/bin/env bash
# Cloud Functions deploys upload only this directory and remote-`npm install`
# it — plain npm doesn't understand pnpm's "workspace:" protocol, so
# @lps/shared can't be a normal workspace dependency here. Instead we vendor
# a built copy into vendor/lps-shared and depend on it via "file:", which
# plain npm resolves fine since the target now lives inside the uploaded tree.
set -euo pipefail
cd "$(dirname "$0")/.."

npm --prefix ../packages/shared run build

rm -rf vendor/lps-shared
mkdir -p vendor/lps-shared
cp -R ../packages/shared/package.json ../packages/shared/lib vendor/lps-shared/
