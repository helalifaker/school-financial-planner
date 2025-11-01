# GitHub + Vercel Deployment Guide

Your school financial planner application is already optimized for GitHub + Vercel deployment! Here's how to set it up:

## Prerequisites

- GitHub account
- Vercel account (can sign up with GitHub)
- Node.js 20.9.0 or higher (you already have v24.11.0)

## Step 1: Push Code to GitHub

### Option A: Using Command Line

```bash
# Navigate to the project directory
cd school-financial-planner

# Initialize git repository (if not already done)
git init

# Add all files to git
git add .

# Commit all changes
git commit -m "Initial commit: School financial planner with enhanced features"

# Create GitHub repository
# Go to https://github.com/new and create a new repository named "school-financial-planner"

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/school-financial-planner.git

# Push to GitHub
git push -u origin main
```

### Option B: Using GitHub Desktop

1. Open GitHub Desktop
2. Add existing repository from your local machine
3. Create repository on GitHub Hub named "school-financial-planner"
4. Publish repository

## Step 2: Deploy to Vercel

### Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

### Configure Build Settings

Vercel should auto-detect these settings:
- **Framework**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `out` (automatically set due to static export)

### Environment Variables

Add these environment variables in Vercel dashboard:

1. Go to your project settings in Vercel
2. Navigate to "Environment Variables"
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://unwehmjzzyghaslunkkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2VobWp6enlnaGFzbHVua2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NDY0OTksImV4cCI6MjA3NzQyMjQ5OX0.jGLRYqCQpsWUH4BPQ5gvdeez9o1H18Hf0W3ULEpfTRs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2VobWp6enlnaGFzbHVua2tsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg0NjQ5OSwiZXhwIjoyMDc3NDIyNDk5fQ.6w4PrwcdYaOaZhdhMzfJAlO5GVZVFyKechSVhXIuzfE
NODE_ENV=production
```

### Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Step 3: Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed by Vercel

### SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## What's Already Configured

✅ **Next.js Static Export**: Already configured in `next.config.js`
✅ **Supabase Integration**: Environment variables ready
✅ **Build Optimization**: Package.json scripts optimized
✅ **Static Assets**: Public folder configured
✅ **TypeScript Support**: tsconfig.json included

## Current Features (Working)

✅ **Enhanced Assumptions Page**: "Others Expenses (% of Staff Costs)" field
✅ **30-Year Planning Horizon**: Financial statements show 2023-2052
⚠️ **Historical Data**: 2023-2024 columns mentioned in UI but not displayed in tables

## Troubleshooting

### Build Failures

If build fails:
1. Check that Node.js version is 20.9.0+
2. Verify environment variables are set
3. Check build logs in Vercel dashboard

### Static Export Issues

The app is configured for static export, so all data fetching happens client-side from Supabase. This is perfect for Vercel deployment.

### Supabase Connection

Make sure environment variables are properly set in Vercel. The Supabase instance is already running and accessible.

## Alternative: Pre-built Files

If you prefer to deploy immediately without GitHub setup:

The `out/` directory contains the built static files. You can upload these to any static hosting service (Netlify, GitHub Pages, etc.).

## Security Notes

- Keep the `SUPABASE_SERVICE_ROLE_KEY` secure (it's already in environment variables)
- The anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) is safe to be public
- All Supabase operations use Row Level Security

## Next Steps

After successful deployment:
1. Test all features with the provided test account
2. Update any remaining historical data display issues
3. Customize the app as needed

---

**Note**: Your current deployment at https://34b5xdnkclkg.space.minimax.io will remain active while you set up GitHub + Vercel. You can switch to Vercel once everything is configured.