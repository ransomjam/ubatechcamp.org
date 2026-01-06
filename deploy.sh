#!/bin/bash

# Clear build cache and rebuild for deployment
echo "Clearing build cache..."
rm -rf dist/
rm -rf node_modules/.vite/

echo "Rebuilding application..."
npm run build

echo "Build complete. Ready for deployment."