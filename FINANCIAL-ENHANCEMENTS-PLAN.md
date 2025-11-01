# Financial Statement Enhancements - Implementation Plan

**Date:** November 1, 2025  
**Scope:** Major Feature Release - Production Grade

## Requirements Summary

### 1. P&L Enhancements
- **Other Expenses Section:** Add percentage-based input (similar to staff cost)
- **Historical Data:** Display 2023-2024 actuals from uploaded Excel
- **All Periods View:** Toggle to show 2023-2052 (30 years) in single view

### 2. Balance Sheet Restructure
- **Asset Categories:** Reorganize into 3 categories
  1. Cash (balancing variable)
  2. Receivable & Others (AR, Inventory, Prepaid)
  3. Tangible/Intangible Assets (PPE net)
- **Base Year:** Set 2024 as starting point for projections
- **Cash Balancing:** Automatic calculation to maintain Assets = Liab + Equity

### 3. Export Functionality
- Fix non-functional export button
- Support CSV/PDF export for all statements
- Include historical data in exports

## Historical Data Structure (from financial data.xlsx)

### P&L (2022-2024 Actuals)
```
                        2022          2023          2024
Tuition French Cur.     49,222,538    55,819,340    65,503,278
Tuition IB              0             0             0
Other Income            3,044,851     4,373,210     5,015,995
Total Revenues          52,267,389    60,192,550    70,519,273

Salaries & Related     -23,799,958   -28,460,183   -29,874,321
School Rent             -7,939,656    -7,939,656    -7,631,145
Other Expenses         -18,612,247   -21,816,348   -29,830,920
Total Opex             -50,351,861   -58,216,187   -67,336,386

Depreciation            -2,050,143    -2,360,301    -3,612,073
Interest Income            136,826       382,960       432,479
NET RESULT                   2,211          -978         3,292
```

### Balance Sheet (2022-2024 Actuals)
```
ASSETS                  2022          2023          2024
Cash                   20,609,776    21,580,604    18,250,072
AR Net                 11,925,457     9,429,976    14,301,148
Prepaid & Other            38,500         5,500         3,999
Loans & Advances                0       151,750       106,000
Current Assets         32,573,733    31,167,830    32,661,219

Tangible/Intangible    17,923,797    26,885,609    36,225,743
(Gross - Accumulated Dep)

TOTAL ASSETS           50,497,530    58,053,439    68,886,962

LIABILITIES
AP                      3,980,678     3,023,457     4,087,609
Accrued Expenses          348,372     1,791,737       204,597
Deferred Income        20,961,305    21,986,734    23,726,112
Current Liabilities    25,290,355    26,801,928    28,018,318

Provisions             15,178,984    21,535,293    31,149,512
Total Liabilities      40,469,339    48,337,221    59,167,830

EQUITY                 10,028,191     9,716,218     9,719,132
```

## Implementation Phases

### Phase 1: Backend (Edge Function) Updates

**File:** `supabase/functions/run-model/index.ts`

**Changes:**
1. Add historical data (2023-2024) to results structure
2. Add `other_expenses` calculation field
3. Restructure Balance Sheet calculations:
   - Group assets into 3 categories
   - Implement cash as balancing variable
   - Ensure Assets = Liabilities + Equity always
4. Update opening balance to use 2024 as base year

**New Data Structure:**
```typescript
results = {
  historical_data: {
    '2023': { profit_loss, balance_sheet },
    '2024': { profit_loss, balance_sheet }
  },
  revenue_streams: { '2025'...'2052' },
  profit_loss: { '2025'...'2052' },
  balance_sheet: { '2025'...'2052' },
  cash_flow: { '2025'...'2052' },
  controls: {},
  ratios: {}
}
```

### Phase 2: Assumptions Page Updates

**File:** `app/assumptions/page.tsx`

**Changes:**
1. Add "Other Expenses" percentage field to near-term (2025-2027)
2. Add "Other Expenses" percentage field to long-term (2028-2052)
3. Add growth frequency for other expenses
4. Update state management
5. Update handleRunModel to include other_expenses_pct

**UI Location:** Between "School Rent" and "CAPEX Planning" sections

### Phase 3: Version Detail Page Updates

**File:** `app/versions/[id]/page.tsx`

**Changes:**
1. Add "All Periods" toggle switch
2. Implement historical data display (2023-2024)
3. Add "Other Expenses" row to P&L table
4. Restructure Balance Sheet display:
   - Cash category
   - Receivable & Others category  
   - Tangible/Intangible Assets category
5. Fix export button functionality:
   - Implement CSV export
   - Include all periods
   - Include historical data

**UI Updates:**
- Toggle button in header: "Show All Periods" (2023-2052 vs 2025-2034)
- Historical data in lighter background color
- Export button with working download functionality

### Phase 4: Export Functionality

**Implementation:**
1. Add export utility function
2. Generate CSV with all financial data
3. Trigger browser download
4. Support separate exports for P&L, Balance Sheet, Cash Flow

## Testing Plan

### Unit Tests
- [ ] Historical data correctly integrated
- [ ] Other expenses calculation accurate
- [ ] Cash balancing logic works (Assets = Liab + Equity)
- [ ] All periods view displays 30 years
- [ ] Export generates correct CSV format

### Integration Tests
- [ ] Create version with other expenses
- [ ] Verify all periods toggle
- [ ] Test export download
- [ ] Validate calculations match Excel formulas
- [ ] Check backward compatibility

### User Acceptance Tests
- [ ] Historical data matches uploaded Excel
- [ ] Balance sheet equation always balanced
- [ ] Export includes all required data
- [ ] UI responsive and intuitive

## Rollout Strategy

1. **Commit 1:** Edge function updates with historical data
2. **Commit 2:** Assumptions page with other expenses input
3. **Commit 3:** Version detail page with all periods view
4. **Commit 4:** Export functionality
5. **Commit 5:** Documentation and deployment guide

## Backward Compatibility

- Existing versions without other_expenses will default to 0%
- Historical data is optional (only shown if available)
- All periods view is opt-in toggle
- Export works for both old and new versions

## Success Criteria

- [ ] Other expenses captured in assumptions and displayed in P&L
- [ ] Historical data (2023-2024) displays correctly
- [ ] All periods view shows 2023-2052 (30 years)
- [ ] Balance Sheet shows 3 asset categories
- [ ] Cash balances the equation automatically
- [ ] Export button downloads complete financial statements
- [ ] All tests pass
- [ ] Production deployment successful

## Timeline Estimate

- Phase 1 (Backend): 1-2 hours
- Phase 2 (Assumptions): 30-45 minutes  
- Phase 3 (Display): 1-2 hours
- Phase 4 (Export): 30-45 minutes
- Testing: 1 hour
- **Total: 4-6 hours**

---

**Status:** Implementation plan complete. Ready to begin Phase 1.
