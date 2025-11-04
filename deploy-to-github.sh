#!/bin/bash

# GitHub Pages Deployment Script for Jack Portfolio
# This script prepares and deploys your app to GitHub Pages

set -e  # Exit on error

echo "🎨 Jack Portfolio - GitHub Pages Deployment"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if gh-pages is installed
echo "📦 Checking dependencies..."
if ! npm list gh-pages > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing gh-pages...${NC}"
    npm install --save-dev gh-pages
fi

# Step 2: Verify package.json homepage
echo ""
echo "🔍 Verifying package.json configuration..."
if grep -q "YOUR_USERNAME" package.json; then
    echo -e "${RED}❌ ERROR: You need to update the 'homepage' field in package.json${NC}"
    echo ""
    echo "Please replace:"
    echo '  "homepage": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"'
    echo ""
    echo "With your actual GitHub username and repository name:"
    echo '  "homepage": "https://yourusername.github.io/your-repo-name"'
    echo ""
    exit 1
fi

# Step 3: Check if git repository is initialized
echo ""
echo "🔧 Checking git repository..."
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
fi

# Step 4: Check if remote origin exists
if ! git remote | grep -q "origin"; then
    echo -e "${RED}❌ ERROR: No git remote 'origin' configured${NC}"
    echo ""
    echo "Please add your GitHub repository as remote:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo ""
    exit 1
fi

# Step 5: Verify Firebase rules exist
echo ""
echo "🔒 Verifying Firebase security rules..."
if [ ! -f "firestore.rules" ]; then
    echo -e "${RED}❌ WARNING: firestore.rules not found${NC}"
    echo "Make sure to deploy your Firestore rules separately!"
fi

# Step 6: Build the app
echo ""
echo "🏗️  Building the app..."
echo ""
npm run build

# Step 7: Deploy to GitHub Pages
echo ""
echo "🚀 Deploying to GitHub Pages..."
echo ""
npm run deploy

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your site should be available at:"
grep "homepage" package.json | sed 's/.*"homepage": "\(.*\)".*/\1/'
echo ""
echo "📝 Next steps:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to Pages section"
echo "3. Ensure source is set to 'gh-pages' branch"
echo "4. Add your GitHub Pages domain to Firebase Authentication authorized domains"
echo ""
echo "🎉 Happy deploying!"
