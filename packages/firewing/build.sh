#!/bin/sh

# Builds all packages in Firewing to prepare for distribution on NPM.

# First, clone the `packages` folder into `dist/packages`.
rm -rf dist
mkdir -p dist
rsync -av \
  --exclude="node_modules" \
  --exclude="dist" \
  --exclude="build.sh" \
  --exclude="tsconfig.dist.json" \
  --exclude=".DS_Store" \
  --exclude="*.stories.tsx" \
  --exclude="*.test.ts" \
  . \
  dist

# Remove the "private" field from package.json.
sed -i '' '/"private": true,/d' dist/package.json

# Now build the TypeScript into JS.
../../node_modules/.bin/tsc -p tsconfig.dist.json
