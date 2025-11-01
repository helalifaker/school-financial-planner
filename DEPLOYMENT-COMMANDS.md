# Deployment Commands - School Financial Planner

## Quick Deployment Steps

### 1. GitHub Deployment

Open your terminal and run these commands in order:

```bash
# Navigate to your project
cd ~/Documents/school-financial-planner

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Implement advanced recurring CAPEX system with property metadata fields"

# Push to GitHub (choose one method below)
```

**Method A: Using Personal Access Token**
```bash
# Replace YOUR_TOKEN with your GitHub personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/helalifaker/school-financial-planner.git
git push origin main
```

**Method B: Using SSH (if configured)**
```bash
git remote set-url origin git@github.com:helalifaker/school-financial-planner.git
git push origin main
```

**Method C: Upload Files Manually**
If authentication fails, you can:
1. Download the entire project folder from here
2. Upload it to your GitHub repository using the web interface
3. Or use GitHub Desktop

### 2. Vercel Deployment

After pushing to GitHub:
1. Vercel will automatically detect changes and start building
2. Wait 2-3 minutes for deployment to complete
3. Check your live application: https://school-financial-planner-rpfb-e4mqm9vr1-faker-helalis-projects.vercel.app

### 3. Supabase Edge Function (if needed)

If you need to update the financial calculations:
1. Go to: https://supabase.com/dashboard/project/unwehmjzzyghaslunkkl
2. Navigate to Edge Functions → run-model
3. Copy the code from `/workspace/school-financial-planner/supabase/functions/run-model/index.ts`
4. Deploy the updated function

## Testing Checklist

After deployment, test these new features:

### ✅ Property Metadata Fields
- [ ] Create new version - see Land Size, Building Size, Comments fields
- [ ] Fill in property details (e.g., Land: 2,500 m², Building: 8,000 m²)
- [ ] Verify fields appear in version list and detail views

### ✅ French/IB Curriculum Split  
- [ ] Near-term section: Separate French and IB student enrollment
- [ ] Dual tuition rates with shared growth parameters
- [ ] Growth frequency dropdown: 1-5 year options

### ✅ Recurring CAPEX System
- [ ] Manual CAPEX: Add entries for 2025-2027
- [ ] Recurring CAPEX: Configure categories for 2028-2052
- [ ] Auto-generation preview shows scheduled entries
- [ ] Test category: IT & Digital Learning, Base: 750,000 SAR

### ✅ Rent Model Enhancement
- [ ] Switch between "Fixed Plus Inflation" and "Percentage of Revenue"
- [ ] Conditional fields display correctly for each model

## Support

If you encounter issues:
1. Check that all files were uploaded to GitHub
2. Verify Vercel build completed without errors
3. Test the live application functionality
4. Review browser console for any JavaScript errors

**Current Live URL:** https://school-financial-planner-rpfb-e4mqm9vr1-faker-helalis-projects.vercel.app