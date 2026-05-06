#!/bin/bash

echo "🚀 SHADOWX DEPLOYMENT HELPER"
echo "============================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

echo ""
echo "📦 What do you want to deploy?"
echo ""
echo "1. Push to GitHub (first time)"
echo "2. Update GitHub (after changes)"
echo "3. Deploy Trading App to Vercel"
echo "4. Deploy Marketing Page to Vercel"
echo "5. Do everything (GitHub + Both apps)"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        read -p "Enter your GitHub username: " username
        read -p "Enter repository name (default: shadowx-settle): " repo
        repo=${repo:-shadowx-settle}
        
        echo ""
        echo "🔄 Adding files to Git..."
        git add .
        git commit -m "ShadowX Settle - Colosseum Hackathon 2026"
        
        echo ""
        echo "🔗 Adding GitHub remote..."
        git remote add origin https://github.com/$username/$repo.git
        
        echo ""
        echo "📤 Pushing to GitHub..."
        git branch -M main
        git push -u origin main
        
        echo ""
        echo "✅ Code pushed to GitHub!"
        echo "🔗 View at: https://github.com/$username/$repo"
        ;;
        
    2)
        echo ""
        read -p "Commit message: " message
        message=${message:-"Update ShadowX"}
        
        git add .
        git commit -m "$message"
        git push
        
        echo ""
        echo "✅ Changes pushed to GitHub!"
        ;;
        
    3)
        echo ""
        echo "🏗️ Building Trading App..."
        cd app
        npm install
        npm run build
        
        echo ""
        echo "📤 Deploying to Vercel..."
        echo ""
        echo "Run this command:"
        echo "  vercel --prod"
        echo ""
        echo "Or go to https://vercel.com and import your GitHub repo"
        ;;
        
    4)
        echo ""
        echo "📤 Deploying Marketing Page..."
        echo ""
        echo "Go to https://vercel.com and:"
        echo "1. Import your GitHub repo"
        echo "2. Set Root Directory: apps/web/public"
        echo "3. Leave Build Command empty"
        echo "4. Deploy!"
        ;;
        
    5)
        echo ""
        read -p "Enter your GitHub username: " username
        read -p "Enter repository name (default: shadowx-settle): " repo
        repo=${repo:-shadowx-settle}
        
        echo ""
        echo "🔄 Step 1: Pushing to GitHub..."
        git add .
        git commit -m "ShadowX Settle - Colosseum Hackathon 2026"
        
        if ! git remote | grep -q origin; then
            git remote add origin https://github.com/$username/$repo.git
        fi
        
        git branch -M main
        git push -u origin main
        
        echo ""
        echo "✅ GitHub done!"
        echo ""
        echo "🏗️ Step 2: Building Trading App..."
        cd app
        npm install
        npm run build
        cd ..
        
        echo ""
        echo "✅ Build complete!"
        echo ""
        echo "📋 NEXT STEPS:"
        echo ""
        echo "1. Go to https://vercel.com"
        echo "2. Click 'Add New' → 'Project'"
        echo "3. Import your repo: https://github.com/$username/$repo"
        echo "4. Deploy TWO projects:"
        echo ""
        echo "   PROJECT 1 - Trading App:"
        echo "   - Root Directory: app"
        echo "   - Build Command: npm run build"
        echo "   - Output: dist"
        echo ""
        echo "   PROJECT 2 - Marketing Page:"
        echo "   - Root Directory: apps/web/public"
        echo "   - Build Command: (leave empty)"
        echo "   - Output: ."
        echo ""
        echo "5. You'll get two URLs like:"
        echo "   - https://shadowx-app.vercel.app"
        echo "   - https://shadowx.vercel.app"
        echo ""
        echo "6. Update marketing page links to use your trading app URL"
        echo ""
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"
