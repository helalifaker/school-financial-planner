# School Financial Planning Application - Database Schema

## Tables Overview

### 1. profiles (extends auth.users)
Stores user profile information
- id (uuid, PK) - references auth.users
- email (text)
- full_name (text)
- role (text) - 'admin', 'analyst', 'viewer'
- created_at (timestamptz)
- updated_at (timestamptz)

### 2. versions
Stores complete model run snapshots
- id (uuid, PK)
- name (text) - e.g., "Base Case - Sep 2025"
- version_type (text) - 'base', 'optimistic', 'downside'
- created_by (uuid) - references profiles.id
- created_at (timestamptz)
- updated_at (timestamptz)
- is_active (boolean)
- metadata (jsonb) - additional version metadata

### 3. assumptions
Stores all planning input assumptions for each version
- id (uuid, PK)
- version_id (uuid) - references versions.id
- general_setup (jsonb) - school name, planning horizon, currency, display units
- strategic_near_term (jsonb) - 2025-2027 assumptions
- strategic_long_term (jsonb) - 2028-2052 assumptions
- capex_table (jsonb) - array of capex entries
- working_capital (jsonb) - AR days, AP days, deferred income, inventory
- opening_balance_sheet (jsonb) - 2024 opening balances
- created_at (timestamptz)
- updated_at (timestamptz)

### 4. results
Stores calculated financial statements and controls
- id (uuid, PK)
- version_id (uuid) - references versions.id
- revenue_streams (jsonb) - tuition and income by year
- profit_loss (jsonb) - P&L statement by year
- balance_sheet (jsonb) - balance sheet by year
- cash_flow (jsonb) - cash flow statement by year
- controls (jsonb) - BS parity and CF reconciliation
- ratios (jsonb) - all KPIs and ratios
- created_at (timestamptz)
- updated_at (timestamptz)

### 5. audit_trails
Tracks all user actions for compliance
- id (uuid, PK)
- user_id (uuid) - references profiles.id
- version_id (uuid) - references versions.id (nullable)
- action_type (text) - 'create', 'update', 'delete', 'view', 'export'
- action_description (text)
- metadata (jsonb) - additional context
- created_at (timestamptz)

## JSONB Structure Examples

### assumptions.general_setup
```json
{
  "school_name": "Example School",
  "planning_horizon": {"start": 2024, "end": 2052},
  "currency": "SAR",
  "display_units": "M SAR"
}
```

### assumptions.strategic_near_term
```json
{
  "2025": {
    "students": {"french": 850, "ib": 100},
    "tuition": {"french": 82000, "ib": 95000},
    "growth_rate": 0.05,
    "staff_cost_pct": 0.42,
    "opex_pct": 0.43,
    "rent_model": {"type": "fixed", "amount": 8000000}
  },
  "2026": {...},
  "2027": {...}
}
```

### results.profit_loss
```json
{
  "2024": {
    "tuition_french": 65503278,
    "tuition_ib": 0,
    "other_income": 5015995,
    "total_revenues": 70519273,
    "salaries": -29874321,
    "rent": -7631145,
    "other_expenses": -29830920,
    "total_operating_expenses": -67336386,
    "ebitda": 3182887,
    "depreciation": -3612073,
    "interest_income": 432479,
    "net_result": 3293
  },
  "2025": {...}
}
```

### results.controls
```json
{
  "balance_sheet_parity": {
    "2024": {"assets": 50.497, "liab_equity": 50.497, "difference": 0.0, "status": "OK"},
    "2025": {...}
  },
  "cash_flow_reconciliation": {
    "2024": {"cf_ending_cash": 21.581, "bs_cash": 21.581, "difference": 0.0, "status": "OK"},
    "2025": {...}
  }
}
```

## RLS Policies

All tables will have RLS enabled with policies for:
- INSERT: authenticated users (anon + service_role)
- SELECT: authenticated users (anon + service_role)
- UPDATE: authenticated users (anon + service_role) - own records or admin
- DELETE: admin only

## Indexes

- versions.created_by
- versions.created_at
- assumptions.version_id
- results.version_id
- audit_trails.user_id
- audit_trails.created_at
