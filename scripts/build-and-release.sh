#!/bin/bash

# Build and Release Script for Allyson Chrome Extension
# This script builds the extension, packages it, and creates a GitHub release

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

# Check if version is provided
if [ -z "$1" ]; then
  # If no version provided, use the one from package.json
  VERSION=$(grep '"version"' package.json | sed 's/.*: "\(.*\)",/\1/')
  print_yellow "No version provided, using version from package.json: $VERSION"
else
  VERSION=$1
  print_yellow "Using provided version: $VERSION"
  
  # Update version in package.json
  sed -i '' "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
  print_green "Updated version in package.json to $VERSION"
fi

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

# Ask if user wants to create a GitHub release
read -p "Do you want to create a GitHub release? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Check if gh CLI is installed
  if ! command -v gh &> /dev/null; then
    print_red "GitHub CLI not found. Please install it with 'brew install gh' and try again."
    exit 1
  fi
  
  # Check if user is authenticated with GitHub
  if ! gh auth status &> /dev/null; then
    print_yellow "You need to authenticate with GitHub first."
    gh auth login
  fi
  
  # Create git tag
  print_yellow "Creating git tag v$VERSION..."
  git tag -a "v$VERSION" -m "Release version $VERSION"
  
  # Push tag to GitHub
  print_yellow "Pushing tag to GitHub..."
  git push origin "v$VERSION"
  
  # Create GitHub release
  print_yellow "Creating GitHub release..."
  gh release create "v$VERSION" \
    --title "Release v$VERSION" \
    --notes "See [CHANGELOG.md](https://github.com/Allyson-AI/chrome-extension/blob/main/CHANGELOG.md) for details." \
    "build/chrome-mv3-prod.zip"
  
  print_green "GitHub release created successfully!"
  
  # Ask if user wants to submit to Chrome Web Store
  read -p "Do you want to submit to Chrome Web Store? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ ! -f "keys.json" ]; then
      print_red "Error: keys.json file not found! Cannot submit to Chrome Web Store."
      exit 1
    fi
    
    print_yellow "Submitting to Chrome Web Store..."
    npx @plasmohq/bpp build/chrome-mv3-prod.zip
    
    print_green "Submission to Chrome Web Store completed!"
  fi
else
  print_yellow "Skipping GitHub release."
fi

print_green "Build and package process completed successfully!" 