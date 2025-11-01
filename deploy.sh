#!/bin/bash

# Deployment Script for School Financial Planner
# This script pushes all commits and provides deployment instructions

set -e  # Exit on error

echo "=========================================="
echo "School Financial Planner - Deployment"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    echo "Please run this script from /workspace/school-financial-planner"
    exit 1
fi

# Show commits to be pushed
echo "📦 Commits ready for deployment:"
echo ""
git log origin/main..HEAD --oneline || git log --oneline -5
echo ""

# Show git status
echo "📊 Git status:"
git status -s
echo ""

# Prompt for deployment method
echo "Choose deployment method:"
echo "1. Push with GitHub Personal Access Token"
echo "2. Push with SSH (requires SSH key configured)"
echo "3. Skip push (I'll do it manually)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        read -p "Enter your GitHub Personal Access Token: " token
        if [ -z "$token" ]; then
            echo "❌ Token cannot be empty"
            exit 1
        fi
        
        echo "🔄 Configuring git remote..."
        git remote set-url origin "https://${token}@github.com/helalifaker/school-financial-planner.git"
        
        echo "🚀 Pushing to GitHub..."
        git push origin main
        
        # Restore to HTTPS without token for security
        git remote set-url origin "https://github.com/helalifaker/school-financial-planner.git"
        
        echo "✅ Successfully pushed to GitHub!"
        ;;
        
    2)
        echo "🔄 Switching to SSH remote..."
        git remote set-url origin "git@github.com:helalifaker/school-financial-planner.git"
        
        echo "🚀 Pushing to GitHub..."
        git push origin main
        
        echo "✅ Successfully pushed to GitHub!"
        ;;
        
    3)
        echo "⏭️  Skipping automatic push"
        echo ""
        echo "To push manually, run:"
        echo "  git push origin main"
        echo ""
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Deployment status
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. ✅ GitHub: ${choice != 3 ? 'PUSHED' : 'PENDING (manual push required)'}"
echo "2. ⏳ Vercel: Will auto-deploy from main branch (check vercel.com)"
echo "3. ⏳ Supabase Edge Function: Deploy run-model via dashboard or CLI"
echo ""
echo "Supabase Deployment Options:"
echo ""
echo "  Option A - Via Dashboard:"
echo "    1. Visit: https://supabase.com/dashboard/project/unwehmjzzyghaslunkkl"
echo "    2. Go to Edge Functions → run-model"
echo "    3. Copy code from: supabase/functions/run-model/index.ts"
echo "    4. Deploy"
echo ""
echo "  Option B - Via CLI:"
echo "    supabase login"
echo "    supabase link --project-ref unwehmjzzyghaslunkkl"
echo "    supabase functions deploy run-model"
echo ""
echo "=========================================="
echo "Testing Instructions:"
echo "=========================================="
echo ""
echo "After deployment completes, test at:"
echo "https://school-financial-planner-rpfb-e4mqm9vr1-faker-helalis-projects.vercel.app"
echo ""
echo "Test checklist:"
echo "  [ ] Property metadata fields (land size, building size, comments)"
echo "  [ ] French/IB student enrollment split"
echo "  [ ] Dual tuition rates with shared growth (1-5 years)"
echo "  [ ] Recurring CAPEX configuration and preview"
echo "  [ ] Version list displays property info"
echo "  [ ] Version detail shows property information"
echo ""
echo "✅ Deployment preparation complete!"
echo ""
