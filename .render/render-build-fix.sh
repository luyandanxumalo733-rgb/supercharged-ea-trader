#!/bin/bash

# Render Build Fix for TanStack Start
# This ensures the build output is in the correct directory

set -e

echo "========================================="
echo "🚀 Building for Render (TanStack Start)"
echo "========================================="

echo "\n📦 Installing dependencies..."
npm install

echo "\n🔨 Building application..."
npm run build

echo "\n✅ Checking build output..."

# TanStack Start may output to different locations
if [ -d ".output" ]; then
  echo "✓ Found .output directory"
  if [ ! -d "dist" ]; then
    echo "  Moving .output to dist/"
    mv .output dist
  fi
fi

if [ -d "dist" ]; then
  echo "✓ dist directory exists"
  ls -la dist/ | head -20
  echo "..."
else
  echo "✗ ERROR: dist directory not found"
  echo "Build failed - no output directory"
  exit 1
fi

# Check for index.html
if [ -f "dist/index.html" ]; then
  echo "✓ dist/index.html found"
else
  echo "⚠ WARNING: dist/index.html not found"
  echo "Checking dist contents:"
  find dist -type f -name "*.html" | head -10
fi

echo "\n========================================="
echo "✅ Build completed successfully!"
echo "========================================="
echo "Output: ./dist"
echo "Ready for Render!"
