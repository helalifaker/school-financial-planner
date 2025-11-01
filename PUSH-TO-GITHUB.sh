#!/bin/bash

# DEPLOYMENT SCRIPT - School Financial Planner
# This script helps deploy the 8 pending commits to GitHub
# Run this script from your LOCAL MACHINE (not in the workspace)

set -e

echo "=============================================="
echo "School Financial Planner - Deployment Helper"
echo "=============================================="
echo ""
echo "This script will help you push 8 commits to GitHub:"
echo "  1. French/IB curriculum split"
echo "  2. Recurring CAPEX planning system"
echo "  3. Property metadata fields"
echo "  4. CAPEX data structure fix"
echo "  5. Documentation updates"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "ERROR: This script must be run from the project root directory"
    echo "Please cd to the school-financial-planner directory first"
    exit 1
fi

# Show current git status
echo "Current Git Status:"
echo "-------------------"
git status -sb
echo ""

# Count commits ahead
COMMITS_AHEAD=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo "0")

if [ "$COMMITS_AHEAD" -eq "0" ]; then
    echo "No commits to push. Already up to date!"
    exit 0
fi

echo "You have $COMMITS_AHEAD commits ready to push"
echo ""

# Show commits to be pushed
echo "Commits to be pushed:"
echo "--------------------"
git log origin/main..HEAD --oneline --no-decorate
echo ""

# Prompt for push method
echo "Choose deployment method:"
echo "  1) Push using GitHub Personal Access Token (PAT)"
echo "  2) Push using SSH (requires SSH key configured)"
echo "  3) Show manual push commands and exit"
echo "  4) Exit without pushing"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "GitHub Personal Access Token Method"
        echo "-----------------------------------"
        echo "If you don't have a PAT, create one at:"
        echo "https://github.com/settings/tokens"
        echo "Required scope: repo (Full control of private repositories)"
        echo ""
        read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
        echo ""
        
        if [ -z "$GITHUB_TOKEN" ]; then
            echo "ERROR: Token cannot be empty"
            exit 1
        fi
        
        echo ""
        echo "Configuring git remote with token..."
        REPO_URL=$(git remote get-url origin)
        REPO_PATH=$(echo $REPO_URL | sed 's|https://github.com/||' | sed 's|.git$||')
        
        git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${REPO_PATH}.git"
        
        echo "Pushing to GitHub..."
        git push origin main
        
        # Restore original URL (security best practice)
        git remote set-url origin "https://github.com/${REPO_PATH}.git"
        
        echo ""
        echo "SUCCESS! Changes pushed to GitHub"
        ;;
        
    2)
        echo ""
        echo "SSH Method"
        echo "----------"
        echo "Switching to SSH remote..."
        REPO_URL=$(git remote get-url origin)
        REPO_PATH=$(echo $REPO_URL | sed 's|https://github.com/||' | sed 's|.git$||')
        
        git remote set-url origin "git@github.com:${REPO_PATH}.git"
        
        echo "Pushing to GitHub..."
        git push origin main
        
        echo ""
        echo "SUCCESS! Changes pushed to GitHub"
        ;;
        
    3)
        echo ""
        echo "Manual Push Commands"
        echo "-------------------"
        echo ""
        echo "Method 1: Using Personal Access Token"
        echo "  git remote set-url origin https://<YOUR_TOKEN>@github.com/helalifaker/school-financial-planner.git"
        echo "  git push origin main"
        echo "  git remote set-url origin https://github.com/helalifaker/school-financial-planner.git"
        echo ""
        echo "Method 2: Using SSH"
        echo "  git remote set-url origin git@github.com:helalifaker/school-financial-planner.git"
        echo "  git push origin main"
        echo ""
        exit 0
        ;;
        
    4)
        echo "Exiting without pushing"
        exit 0
        ;;
        
    *)
        echo "ERROR: Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=============================================="
echo "Next Steps:"
echo "=============================================="
echo ""
echo "1. Vercel Deployment:"
echo "   - Check: https://vercel.com/faker-helalis-projects/school-financial-planner"
echo "   - Wait for automatic build (2-3 minutes)"
echo ""
echo "2. Verify Live Application:"
echo "   - URL: https://school-financial-planner-rpfb-e4mqm9vr1-faker-helalis-projects.vercel.app"
echo ""
echo "3. Test New Features:"
echo "   [ ] French/IB student enrollment split"
echo "   [ ] Dual tuition rates with 1-5 year growth frequency"
echo "   [ ] Recurring CAPEX configuration and auto-generation"
echo "   [ ] Property metadata (land size, building size, comments)"
echo ""
echo "4. Edge Function:"
echo "   - Already deployed: run-model (Version 4)"
echo "   - URL: https://unwehmjzzyghaslunkkl.supabase.co/functions/v1/run-model"
echo ""
echo "Deployment complete!"
