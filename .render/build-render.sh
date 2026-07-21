#!/bin/bash

# ============================================
# Render Build Script for supercharged-ea-trader
# ============================================

set -e

echo "========================================"
echo "🚀 Building supercharged-ea-trader"
echo "========================================"

echo "\n📦 Step 1: Installing dependencies..."
if command -v bun &> /dev/null; then
  echo "Using Bun package manager"
  bun install
else
  echo "Using NPM package manager"
  npm install
fi

echo "\n🔨 Step 2: Building TypeScript + React application..."
npm run build

echo "\n✅ Step 3: Verifying build output..."

if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist directory was not created"
  echo "Build output missing"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ ERROR: dist/index.html not found"
  echo "Build is incomplete"
  exit 1
fi

echo "✅ dist/index.html exists"
echo "✅ Build size: $(du -sh dist | cut -f1)"

echo "\n========================================"
echo "✅ Build completed successfully!"
echo "========================================"
echo "\n📁 Output directory: ./dist"
echo "🌐 Ready for Render deployment"
