# Deployment Guide - Enhanced Assumptions Page

## Changes Made

### 1. Enhanced Utils (lib/utils.ts)
Added new formatting utilities:
- `formatCurrencySAR()` - Format currency with commas (e.g., 1,000,000)
- `parseCurrency()` - Parse formatted currency back to number
- `formatPercentageDisplay()` - Format decimal to percentage (0.47 → 47)
- `parsePercentageInput()` - Parse percentage to decimal (47 → 0.47)

### 2. Completely Redesigned Assumptions Page (app/assumptions/page.tsx)
Matched exactly to reference images with the following sections:

#### Strategic Near-Term (2025-2027)
- **Student Enrollment**: Separate inputs for 2025, 2026, 2027 students
- **Tuition Structure**: 
  - 2025 Tuition per Student (SAR) with comma formatting
  - Annual Growth Rate (%)
  - Growth Frequency dropdown
- **Cost Structure**:
  - Staff Costs as % of Revenue (shown as percentage)
  - Opex as % of Revenue (shown as percentage)
- **Rent Model** with conditional fields:
  - Dropdown: Fixed Plus Inflation / Percentage of Revenue
  - For "Fixed Plus Inflation": Base Rent 2025 (SAR) + Inflation Rate (%)
  - For "Percentage of Revenue": Rent as % of Revenue (%)

#### Strategic Long-Term (2028-2052)
- **Enrollment Ramp-Up**:
  - Year 1 (2028), Year 2 (2029), Year 3 (2030), Year 4 (2031), Year 5+ (2032-2052)
- **Same structure** for Tuition, Cost, and Rent as near-term

#### Capital Expenditures (CAPEX) - NEW!
- **Dynamic table** with rows containing:
  - Year (number input)
  - Amount (SAR) with comma formatting
  - Depreciation (years)
  - Description (text input)
  - Delete button (trash icon)
- **Add CAPEX Entry** button to add new rows

#### Working Capital Assumptions - NEW!
- Accounts Receivable (days)
- Accounts Payable (days)
- Inventory (days)

### Key Features Implemented
- ✅ SAR number formatting with commas throughout
- ✅ Percentage display (47% instead of 0.47)
- ✅ Dynamic CAPEX entries with add/delete functionality
- ✅ Working Capital section fully functional
- ✅ Conditional rent model fields (show/hide based on selection)
- ✅ Clean visual layout matching reference images
- ✅ Responsive grid layouts
- ✅ Dark mode support
- ✅ All data properly structured for backend integration

## Deployment Steps

### Option 1: Manual Deployment (Recommended)

1. **Pull the changes from this repository:**
   ```bash
   cd school-financial-planner
   git pull origin main
   ```

2. **If you have uncommitted changes locally, stash or commit them first:**
   ```bash
   git stash  # or git add . && git commit -m "local changes"
   git pull origin main
   git stash pop  # if you stashed
   ```

3. **Vercel will automatically deploy** when changes are pushed to the main branch.
   - Check your Vercel dashboard for deployment status
   - Deployment URL: https://school-financial-planner-rpfb-e4mqm9vr1-faker-helalis-projects.vercel.app

### Option 2: Force Push from Sandbox (If needed)

If you need to force push the changes from this sandbox:

1. **Generate a GitHub Personal Access Token:**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token

2. **Push using the token:**
   ```bash
   cd /workspace/school-financial-planner
   git remote set-url origin https://YOUR_TOKEN@github.com/helalifaker/school-financial-planner.git
   git push origin main
   ```

### Option 3: Download and Push Manually

1. **Download the modified files** from this sandbox
2. **Copy them to your local repository**
3. **Commit and push:**
   ```bash
   git add lib/utils.ts app/assumptions/page.tsx
   git commit -m "Enhanced assumptions page with CAPEX, Working Capital, and improved formatting"
   git push origin main
   ```

## Testing Checklist

After deployment, test the following:

### Near-Term Section
- [ ] Enter student numbers for 2025, 2026, 2027
- [ ] Enter tuition with commas (e.g., 36,903)
- [ ] Change growth rate and frequency
- [ ] Enter staff cost and opex percentages
- [ ] Switch between rent models and verify conditional fields appear/disappear
- [ ] Enter rent values

### Long-Term Section
- [ ] Enter enrollment for Year 1-5+
- [ ] Set long-term tuition and growth parameters
- [ ] Configure cost structure percentages
- [ ] Test rent model selection

### CAPEX Section
- [ ] Add new CAPEX entry
- [ ] Fill in year, amount (with commas), depreciation, description
- [ ] Delete CAPEX entries
- [ ] Verify multiple entries work correctly

### Working Capital Section
- [ ] Enter AR, AP, and Inventory days
- [ ] Verify numbers are properly stored

### Model Execution
- [ ] Enter version name and select type
- [ ] Click "Run Model"
- [ ] Verify model calculates successfully
- [ ] Check that all assumptions are properly saved
- [ ] Navigate to version details page
- [ ] Verify calculations use the new assumptions

## Technical Notes

### Data Structure Changes
The assumptions data structure now includes:
- Simplified near-term structure (single student count per year, split internally)
- Long-term enrollment ramp-up (Year 1-5+)
- CAPEX entries array with dynamic management
- Working capital days (AR, AP, Inventory)
- Rent models with conditional parameters

### Backend Compatibility
The code maintains backward compatibility with the existing `run-model` edge function by:
- Converting simplified inputs to the expected data structure
- Maintaining all required fields
- Preserving the existing assumptions schema

### UI/UX Improvements
- Number inputs now show formatted values (commas for SAR)
- Percentages are displayed as whole numbers (47 instead of 0.47)
- Conditional fields reduce clutter and improve usability
- Color-coded section headers for better visual hierarchy
- Responsive grid layouts for mobile compatibility

## File Changes Summary

```
Modified files:
  lib/utils.ts                    (+27 lines)  - New formatting utilities
  app/assumptions/page.tsx        (+494 lines) - Complete redesign

Total: 2 files changed, 521 insertions(+)
```

## Next Steps

1. Deploy the application
2. Test all sections thoroughly
3. Verify model calculations work correctly
4. Check responsive design on mobile devices
5. Review dark mode appearance
6. Gather user feedback on the new interface

## Support

If you encounter any issues:
1. Check browser console for errors
2. Verify Supabase edge functions are working
3. Check network tab for API call failures
4. Review deployment logs in Vercel dashboard

---

**Deployment Date**: November 1, 2025  
**Author**: MiniMax Agent  
**Version**: 1.0 - Enhanced Assumptions Page
