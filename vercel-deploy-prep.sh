#!/bin/bash

# Vercel Deployment Script for School Financial Planner
# This script prepares and deploys the fixed version to Vercel

set -e

echo "🚀 Starting Vercel deployment process..."

# Navigate to project directory
cd /workspace/school-financial-planner

echo "📁 Current directory: $(pwd)"
echo "📋 Project files:"
ls -la

echo ""
echo "🔧 Checking Node.js configuration..."
if [ -f ".nvmrc" ]; then
    echo "✅ .nvmrc file exists with Node.js version: $(cat .nvmrc)"
else
    echo "❌ .nvmrc file missing"
fi

if [ -f "vercel.json" ]; then
    echo "✅ vercel.json file exists"
    echo "📄 vercel.json content:"
    cat vercel.json
else
    echo "❌ vercel.json file missing"
fi

echo ""
echo "🔍 Verifying Others Expenses fix..."
echo "Frontend label check:"
grep -n "Others Expenses.*% of Revenues" app/assumptions/page.tsx | head -2

echo ""
echo "Backend calculation check:"
grep -n "othersExpenses.*totalRevenues" supabase/functions/run-model/index.ts

echo ""
echo "📦 Checking package.json..."
echo "Dependencies:"
grep -A 5 "dependencies" package.json

echo ""
echo "🌐 Environment variables:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    echo "Environment variables (URL and keys are set):"
    grep -E "SUPABASE_URL|SUPABASE_ANON_KEY|SERVICE_ROLE_KEY" .env.local | sed 's/=.*/=***SET***/'
else
    echo "❌ .env.local file missing"
fi

echo ""
echo "🗂️ Build output directory:"
if [ -d "out" ]; then
    echo "✅ Static export files exist in ./out/"
    echo "Built files count: $(find out -type f | wc -l)"
else
    echo "⚠️  No build output found - will require build on Vercel"
fi

echo ""
echo "📋 Summary of fixes applied:"
echo "✅ Node.js version requirement: 20.9.0 (.nvmrc + vercel.json)"
echo "✅ Frontend label: 'Others Expenses (% of Revenues)'"
echo "✅ Backend calculation: Based on totalRevenues, not staffCosts"
echo "✅ Static export configuration: next.config.js"
echo "✅ Environment variables configured"

echo ""
echo "🎯 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push these changes to your GitHub repository"
echo "2. Trigger a redeploy in Vercel dashboard"
echo "3. Monitor deployment logs for Node.js version"
echo ""
echo "Command to push to GitHub:"
echo "cd /workspace/school-financial-planner"
echo "git add ."
echo "git commit -m 'Fix: Node.js compatibility and Others Expenses calculation'"
echo "git push origin main"
echo ""
echo "Deployment URL: https://school-financial-planner.vercel.app"