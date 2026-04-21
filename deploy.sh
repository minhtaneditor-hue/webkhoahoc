#!/bin/bash

# Universal Deploy Script for Minh Tan Academy
# Usage: npm run deploy "Your commit message here"

# 1. Get the commit message from argument or use default
MESSAGE=$1
if [ -z "$MESSAGE" ]; then
  MESSAGE="chore: automated deployment update $(date +'%Y-%m-%d %H:%M:%S')"
fi

echo "🚀 Starting Deployment Process..."

# 2. Check for changes
if [ -z "$(git status --porcelain)" ]; then 
  echo "✅ No changes to deploy. Your working tree is clean."
  exit 0
fi

# 3. Stage changes
echo "📦 Staging changes..."
git add .

# 4. Commit changes
echo "💾 Committing: $MESSAGE"
git commit -m "$MESSAGE"

# 5. Push to GitHub
echo "📤 Pushing to GitHub (main)..."
git push origin main

if [ $? -eq 0 ]; then
  echo "✨ DEPLOYMENT SUCCESSFUL!"
  echo "🌐 Vercel is now building your latest changes."
else
  echo "❌ DEPLOYMENT FAILED. Please check the error above."
  exit 1
fi
