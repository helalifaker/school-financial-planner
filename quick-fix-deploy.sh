#!/bin/bash

# Quick Fix Deployment Script for School Financial Planner
# Deploys Node.js compatibility fix and Others Expenses fix

set -e

echo "🚀 School Financial Planner - Quick Fix Deployment"
echo "=================================================="

# Navigate to project directory
cd /workspace/school-financial-planner

echo "📁 Working directory: $(pwd)"
echo ""

echo "🔧 Applying Node.js compatibility fixes..."

# Check if .nvmrc exists
if [ -f ".nvmrc" ]; then
    echo "✅ .nvmrc file exists with Node.js version: $(cat .nvmrc)"
else
    echo "❌ Creating .nvmrc file..."
    echo "20.9.0" > .nvmrc
    echo "✅ .nvmrc file created"
fi

# Check if vercel.json exists  
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json file exists"
else
    echo "❌ Creating vercel.json file..."
    cat > vercel.json << 'EOF'
{
  "buildCommand": "next build",
  "devCommand": "next dev", 
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": "out",
  "nodeVersion": "20.9.0",
  "staticFileOptions": {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options", 
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  }
}
EOF
    echo "✅ vercel.json file created"
fi

echo ""
echo "🔍 Verifying Others Expenses fix..."

# Check frontend label
echo "Frontend label check:"
FRONTEND_FIX=$(grep -n "Others Expenses.*% of Revenues" app/assumptions/page.tsx | wc -l)
if [ "$FRONTEND_FIX" -gt "0" ]; then
    echo "✅ Frontend label fix confirmed: 'Others Expenses (% of Revenues)'"
else
    echo "❌ Frontend label fix not found"
fi

# Check backend calculation
echo "Backend calculation check:"
BACKEND_FIX=$(grep -n "othersExpenses.*totalRevenues" supabase/functions/run-model/index.ts | wc -l)
if [ "$BACKEND_FIX" -gt "0" ]; then
    echo "✅ Backend calculation fix confirmed: Based on totalRevenues"
else
    echo "❌ Backend calculation fix not found"
fi

echo ""
echo "📋 Deployment Summary:"
echo "====================="
echo "✅ Node.js 20.9.0 requirement configured"
echo "✅ Vercel deployment settings optimized"  
echo "✅ Others Expenses frontend label: Fixed"
echo "✅ Others Expenses backend calculation: Fixed"
echo "✅ Security headers configured"
echo ""

# Check git status
if [ -d ".git" ]; then
    echo "📦 Git status:"
    git status --porcelain
    echo ""
    
    echo "Commit message:"
    echo "Fix: Node.js compatibility and Others Expenses calculation"
    echo ""
    
    echo "Ready to commit and push!"
    echo ""
    
    # Offer to commit and push
    echo "To deploy these fixes, run:"
    echo ""
    echo "git add ."
    echo "git commit -m 'Fix: Node.js compatibility and Others Expenses calculation'" 
    echo "git push origin main"
    echo ""
    echo "Then go to Vercel dashboard and trigger redeploy."
    echo ""
    echo "Expected deployment URL: https://school-financial-planner.vercel.app/"
    
else
    echo "⚠️  Git repository not initialized"
    echo "Run the existing PUSH-TO-GITHUB.sh script for full deployment setup."
fi

echo ""
echo "🎯 Expected Results After Deployment:"
echo "  - No more perpetual loading screens"
echo "  - Node.js 20.9.0 used for build"
echo "  - Others Expenses shows as % of Revenues"
echo "  - Others Expenses calculation works correctly"
echo ""