#!/bin/bash

# Simple Build Script for Allyson Chrome Extension
# This script builds the extension and packages it

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print with color
print_green() {
  echo -e "${GREEN}$1${NC}"
}

print_yellow() {
  echo -e "${YELLOW}$1${NC}"
}

print_red() {
  echo -e "${RED}$1${NC}"
}

# Ensure environment files exist
if [ ! -f .env.production ]; then
  print_red "Error: .env.production file not found!"
  exit 1
fi

if [ ! -f .env.chrome ]; then
  print_red "Error: .env.chrome file not found!"
  exit 1
fi

# Build the extension
print_yellow "Building extension..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build -- --verbose

# Package the extension
print_yellow "Packaging extension..."
npm run package

# Check if the build was successful
if [ ! -f "build/chrome-mv3-prod.zip" ]; then
  print_red "Error: Build failed! Chrome extension zip not found."
  exit 1
fi

print_green "Extension built and packaged successfully!"
print_yellow "The packaged extension is available at: build/chrome-mv3-prod.zip" 