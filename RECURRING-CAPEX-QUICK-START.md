# Recurring CAPEX Quick Start Guide

## What Changed

Your assumptions page now has TWO CAPEX sections instead of one:

### 1. Near-term Manual CAPEX (2025-2027) - Orange Border
**Same as before** - for specific projects:
- Add individual CAPEX entries manually
- Set year, amount, depreciation, description
- Use for known near-term investments

### 2. Recurring CAPEX Planning (2028-2052) - Purple Border
**NEW FEATURE** - for automated lifecycle management:
- Configure investment categories
- System auto-generates entries based on recurrence rules
- See live preview of all generated CAPEX

## How to Use Recurring CAPEX

### Quick Start (3 Steps)

**Step 1: Click "Add Recurring CAPEX Configuration"**
- New row appears with 7 fields

**Step 2: Configure Your Investment:**
- **Category:** Choose from 5 options (Buildings, FF&E, IT, Transportation, Strategic)
- **Asset Type:** Auto-populated based on category
- **Recurrence:** How often (2, 3, 4, or 5 years)
- **Depreciation:** Accounting period (4, 5, 10, or 15 years)
- **Base Amount:** Investment amount in SAR
- **Starting Year:** When to begin (2028-2032)

**Step 3: View Preview**
- Scroll down to see auto-generated schedule
- Shows all CAPEX entries through 2052

### Common Scenarios

#### IT Equipment (Refresh Every 2 Years)
```
Category: IT & Digital Learning
Asset Type: Computer equipment
Recurrence: 2 years
Depreciation: 4 years
Base Amount: 500,000 SAR
Starting Year: 2028
→ Generates: 2028, 2030, 2032, ..., 2052 (13 entries)
```

#### Building Maintenance (Every 5 Years)
```
Category: Buildings & Facilities
Asset Type: Infrastructure improvements
Recurrence: 5 years
Depreciation: 15 years
Base Amount: 2,000,000 SAR
Starting Year: 2030
→ Generates: 2030, 2035, 2040, 2045, 2050 (5 entries)
```

#### Vehicle Replacement (Every 4 Years)
```
Category: Transportation & Campus Operations
Asset Type: Vehicle fleet
Recurrence: 4 years
Depreciation: 4 years
Base Amount: 1,200,000 SAR
Starting Year: 2028
→ Generates: 2028, 2032, 2036, 2040, 2044, 2048, 2052 (7 entries)
```

## Smart Defaults

When you select a category, the system auto-fills recommended values:

| Category | Default Recurrence | Default Depreciation |
|----------|-------------------|---------------------|
| Buildings & Facilities | 5 years | 15 years |
| FF&E | 5 years | 10 years |
| IT & Digital Learning | 2 years | 4 years |
| Transportation | 4 years | 4 years |
| Strategic/Safety | 5 years | 10 years |

You can override these defaults anytime.

## Preview Table

After configuring, scroll to "Auto-generated CAPEX Schedule":
- **Year:** When investment occurs
- **Description:** Category and asset type
- **Amount:** Investment amount (SAR)
- **Depreciation:** Accounting period

**Summary shows:**
- Total number of entries generated
- Planning period (2028-2052)

## Running the Model

When you click "Run Model":
1. System combines manual CAPEX (2025-2027) + recurring CAPEX (2028-2052)
2. Sends all entries to calculation engine
3. Results include:
   - Balance sheet impact (asset accumulation)
   - Cash flow impact (CAPEX outflows)
   - P&L impact (depreciation expense)

## Tips

### Best Practices
1. **Start simple:** Configure 1-2 categories first
2. **Review preview:** Always check generated schedule before running model
3. **Mix both systems:** Use manual for special projects, recurring for standard lifecycle
4. **Realistic amounts:** Base amounts on actual vendor quotes when possible
5. **Adjust as needed:** Reconfigure anytime - preview updates instantly

### Common Questions

**Q: Can I have multiple configurations for the same category?**
A: Yes! Add multiple rows for different asset types or different recurrence cycles.

**Q: What if I need a one-time project in 2035?**
A: Use manual CAPEX for one-time projects. Set year to 2035 directly.

**Q: How do I delete a configuration?**
A: Click the red trash icon on the right side of the configuration row.

**Q: Does changing a configuration update the preview?**
A: Yes, instantly. The preview always reflects current configurations.

**Q: Can I change the base amount for future years?**
A: Currently, base amount stays constant. Future enhancement could add inflation adjustment.

## Deployment Status

**Current Status:** ✅ Implementation complete, ready to deploy

**To Deploy:**
```bash
cd school-financial-planner
git push origin main
# Vercel will auto-deploy (if connected to GitHub)
```

**Verify Deployment:**
1. Visit your live site
2. Go to Assumptions page
3. Look for two CAPEX sections (orange + purple borders)
4. Test adding a recurring configuration

## Example Configuration Set

For a complete school setup:

```
1. Computer Equipment Refresh
   - Category: IT & Digital Learning
   - Asset Type: Computer equipment
   - Recurrence: 2 years
   - Depreciation: 4 years
   - Base Amount: 750,000 SAR
   - Starting: 2028

2. Building Infrastructure
   - Category: Buildings & Facilities
   - Asset Type: Infrastructure improvements
   - Recurrence: 5 years
   - Depreciation: 15 years
   - Base Amount: 3,000,000 SAR
   - Starting: 2030

3. Furniture Replacement
   - Category: FF&E
   - Asset Type: Furniture & equipment
   - Recurrence: 5 years
   - Depreciation: 10 years
   - Base Amount: 800,000 SAR
   - Starting: 2029

4. Vehicle Fleet
   - Category: Transportation
   - Asset Type: Vehicle fleet
   - Recurrence: 4 years
   - Depreciation: 4 years
   - Base Amount: 1,500,000 SAR
   - Starting: 2028

5. Security Systems
   - Category: Strategic, Safety & Sustainability
   - Asset Type: Safety/security systems
   - Recurrence: 5 years
   - Depreciation: 10 years
   - Base Amount: 600,000 SAR
   - Starting: 2030
```

This gives you comprehensive lifecycle management across all major categories.

## Need Help?

1. Check RECURRING-CAPEX-IMPLEMENTATION.md for technical details
2. Review preview table to verify entries
3. Test with one simple configuration first
4. Browser console shows any JavaScript errors
5. Supabase logs show calculation engine issues

## Next Steps

1. ✅ Code is complete and committed
2. 🔄 Push to GitHub
3. 🔄 Deploy to Vercel
4. ✅ Test the new functionality
5. ✅ Configure your recurring CAPEX rules
6. ✅ Run models and review results

---

**Transform your CAPEX planning from reactive to proactive!**
