# Others Expenses Field Fix Summary

## Issue Fixed
The "Others Expenses" field was incorrectly labeled and calculated as a percentage of **Staff Costs** instead of **Revenues**.

## Changes Made

### 1. Frontend Labels Updated ✅
**File:** `/app/assumptions/page.tsx`
- **Line 771:** Changed label from "Others Expenses (% of Staff Costs)" → "Others Expenses (% of Revenues)"
- **Line 1090:** Changed label from "Others Expenses (% of Staff Costs)" → "Others Expenses (% of Revenues)"

### 2. Backend Calculation Fixed ✅
**File:** `/supabase/functions/run-model/index.ts`
- **Line 260:** Changed calculation from:
  ```javascript
  const othersExpenses = staffCosts * (yearAssumptions.others_expenses_pct || 0.05);
  ```
  To:
  ```javascript
  const othersExpenses = totalRevenues * (yearAssumptions.others_expenses_pct || 0.05);
  ```

### 3. Edge Function Deployed ✅
- Successfully deployed updated `run-model` function to Supabase
- Function Status: ACTIVE
- Version: 6

## Impact

**Before Fix:**
- Others Expenses = Staff Costs × Percentage
- Inconsistent with other cost categories (Staff Costs, Opex)

**After Fix:**
- Others Expenses = Total Revenues × Percentage  
- Consistent calculation methodology across all cost categories
- Proper financial modeling standards

## Testing

The fix has been deployed and is now live on:
- **Vercel Deployment:** https://school-financial-planner.vercel.app/
- **MiniMax Deployment:** https://34b5xdnkclkg.space.minimax.io/

## Next Steps

Users can now:
1. Access the assumptions page
2. Set "Others Expenses (% of Revenues)" to the desired percentage
3. Run the model with the correct calculation
4. See accurate financial projections

The field now properly calculates other expenses as a percentage of total revenues, making it consistent with standard financial modeling practices.