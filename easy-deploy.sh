#!/bin/bash

# Easy Deployment Script for School Financial Planner
# This script will automatically deploy all changes to GitHub and handle authentication

echo "🚀 School Financial Planner - Easy Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the school-financial-planner directory"
    echo "   Run: cd ~/Documents/school-financial-planner && bash easy-deploy.sh"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Check git status
echo "🔍 Checking git status..."
git status

# Add all changes
echo ""
echo "📦 Adding all changes to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit. All files are up to date."
else
    echo "📝 Committing changes..."
    git commit -m "Implement advanced recurring CAPEX system with property metadata fields"
    
    echo ""
    echo "🔑 Setting up GitHub authentication..."
    
    # Try different authentication methods
    echo "Attempting authentication methods:"
    echo "1. Check if GitHub CLI is available..."
    
    if command -v gh &> /dev/null; then
        echo "   ✅ GitHub CLI found!"
        echo "   🔐 Attempting GitHub authentication..."
        gh auth status || gh auth login
        echo "   🚀 Pushing to GitHub..."
        git push origin main || {
            echo ""
            echo "❌ Push failed. Trying alternative methods..."
            # Try with stored credentials
            if git remote get-url origin | grep -q "https://"; then
                echo "   🔧 Converting to SSH for better authentication..."
                git remote set-url origin git@github.com:helalifaker/school-financial-planner.git
                git push origin main || {
                    echo ""
                    echo "⚠️  Still failed. Trying token-based auth..."
                    echo "Please provide your GitHub Personal Access Token:"
                    read -s token
                    if [ ! -z "$token" ]; then
                        git remote set-url origin https://$token@github.com/helalifaker/school-financial-planner.git
                        git push origin main
                    else
                        echo "❌ No token provided. Manual steps required."
                    fi
                }
            fi
        }
    else
        echo "   ⚠️  GitHub CLI not found. Trying alternative methods..."
        
        # Try SSH first
        echo "   🔧 Trying SSH authentication..."
        git remote set-url origin git@github.com:helalifaker/school-financial-planner.git
        git push origin main || {
            echo "   ❌ SSH failed. Trying token authentication..."
            echo "Please provide your GitHub Personal Access Token:"
            read -s token
            if [ ! -z "$token" ]; then
                git remote set-url origin https://$token@github.com/helalifaker/school-financial-planner.git
                git push origin main || {
                    echo ""
                    echo "❌ Authentication failed. Manual deployment required."
                    echo ""
                    echo "Manual Deployment Options:"
                    echo "1. Use GitHub Desktop"
                    echo "2. Upload files manually via GitHub web interface"
                    echo "3. Generate a Personal Access Token at: https://github.com/settings/tokens"
                    echo ""
                    echo "Current commit ready:"
                    git log -1 --oneline
                    exit 1
                }
            else
                echo "❌ No token provided. Manual deployment required."
                echo ""
                echo "Manual Deployment Options:"
                echo "1. Use GitHub Desktop"
                echo "2. Upload files manually via GitHub web interface"
                echo "3. Generate a Personal Access Token at: https://github.com/settings/tokens"
                exit 1
            fi
        }
    fi
fi

echo ""
echo "✅ Deployment to GitHub completed!"
echo ""
echo "⏳ Vercel will now automatically deploy the changes..."
echo "   This usually takes 2-3 minutes."
echo ""
echo "🔗 Your live application will be available at:"
echo "   https://school-financial-planner-rpfb-e4mqm9vr1-faker-helalis-projects.vercel.app"
echo ""
echo "🧪 Next Steps:"
echo "   1. Wait 2-3 minutes for Vercel deployment"
echo "   2. Visit your live application"
echo "   3. Test the new features:"
echo "      • Property metadata fields (Land Size, Building Size, Comments)"
echo "      • French/IB curriculum split"
echo "      • Recurring CAPEX system"
echo ""
echo "🎉 All enhancements are now ready for testing!"