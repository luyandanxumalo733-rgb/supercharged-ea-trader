#!/bin/bash

# Render Build Script
# This script is executed during the Render deployment process

set -e

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build completed successfully!"
echo "Output directory: ./dist"
