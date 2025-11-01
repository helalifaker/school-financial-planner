Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { versionName, versionType, assumptions, propertyMetadata } = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    const payload = JSON.parse(atob(parts[1]));
    const userId = payload.sub;

    // Create version
    const versionResponse = await fetch(`${supabaseUrl}/rest/v1/versions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: versionName,
        version_type: versionType,
        created_by: userId,
        is_active: true,
        metadata: propertyMetadata || {}
      })
    });

    if (!versionResponse.ok) {
      const error = await versionResponse.text();
      throw new Error(`Failed to create version: ${error}`);
    }

    const [version] = await versionResponse.json();
    const versionId = version.id;

    // Save assumptions
    const assumptionsResponse = await fetch(`${supabaseUrl}/rest/v1/assumptions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version_id: versionId,
        general_setup: assumptions.general_setup,
        strategic_near_term: assumptions.strategic_near_term,
        strategic_long_term: assumptions.strategic_long_term || {},
        capex_table: assumptions.capex_table,
        working_capital: assumptions.working_capital,
        opening_balance_sheet: assumptions.opening_balance_sheet
      })
    });

    if (!assumptionsResponse.ok) {
      throw new Error('Failed to save assumptions');
    }

    // Calculate financial model (25+ years from 2025-2052)
    const results = calculateFinancialModel(assumptions);

    // Save results
    const resultsResponse = await fetch(`${supabaseUrl}/rest/v1/results`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version_id: versionId,
        revenue_streams: results.revenue_streams,
        profit_loss: results.profit_loss,
        balance_sheet: results.balance_sheet,
        cash_flow: results.cash_flow,
        controls: results.controls,
        ratios: results.ratios
      })
    });

    if (!resultsResponse.ok) {
      throw new Error('Failed to save results');
    }

    return new Response(
      JSON.stringify({ data: { version_id: versionId, version, results } }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: { message: error.message } }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function calculateFinancialModel(assumptions: any) {
  const startYear = assumptions.general_setup?.planning_horizon?.start || 2024;
  const endYear = assumptions.general_setup?.planning_horizon?.end || 2052;
  const nearTerm = assumptions.strategic_near_term || {};
  const longTerm = assumptions.strategic_long_term || {};
  const capexTable = assumptions.capex_table || [];
  const wc = assumptions.working_capital || {};
  const openingBS = assumptions.opening_balance_sheet || {};
  
  const results: any = {
    revenue_streams: {},
    profit_loss: {},
    balance_sheet: {},
    cash_flow: {},
    controls: { balance_sheet_parity: {} },
    ratios: {}
  };

  // Initialize previous year values from opening balance sheet
  let prevCash = openingBS['2024']?.cash || 18250072;
  let prevAR = openingBS['2024']?.accounts_receivable || 9800000;
  let prevInventory = openingBS['2024']?.inventory || 500000;
  let prevPPE = openingBS['2024']?.ppe_net || 20000000;
  let prevAP = openingBS['2024']?.accounts_payable || 5000000;
  let prevDeferred = openingBS['2024']?.deferred_income || 8000000;
  let prevEquity = openingBS['2024']?.equity || 33550072;

  // Track depreciation schedule
  const depreciationSchedule: any = {};

  // Process CAPEX
  capexTable.forEach((capex: any) => {
    const capexYear = typeof capex.year === 'string' ? capex.year : String(capex.year);
    const amount = capex.amount || 0;
    const period = capex.depreciation_period || 10;
    
    for (let i = 0; i < period; i++) {
      const depYear = String(parseInt(capexYear) + i);
      if (!depreciationSchedule[depYear]) {
        depreciationSchedule[depYear] = 0;
      }
      depreciationSchedule[depYear] += amount / period;
    }
  });

  // Calculate for each year
  for (let year = 2025; year <= endYear; year++) {
    const yearStr = String(year);
    
    // Get assumptions for this year
    let yearAssumptions;
    if (nearTerm[yearStr]) {
      yearAssumptions = nearTerm[yearStr];
    } else if (longTerm[yearStr]) {
      yearAssumptions = longTerm[yearStr];
    } else {
      // Use default growth rate
      const prevYear = String(year - 1);
      const defaultGrowth = assumptions.default_growth_rate || 0.05;
      const prevYearData = nearTerm[prevYear] || longTerm[prevYear] || nearTerm['2027'];
      
      if (prevYearData) {
        yearAssumptions = {
          students: {
            french: Math.round((prevYearData.students?.french || 950) * (1 + defaultGrowth)),
            ib: Math.round((prevYearData.students?.ib || 140) * (1 + defaultGrowth))
          },
          tuition: {
            french: Math.round((prevYearData.tuition?.french || 88000) * (1 + defaultGrowth)),
            ib: Math.round((prevYearData.tuition?.ib || 101000) * (1 + defaultGrowth))
          },
          other_income: Math.round((prevYearData.other_income || 6500000) * (1 + defaultGrowth)),
          staff_cost_pct: prevYearData.staff_cost_pct || 0.42,
          opex_pct: prevYearData.opex_pct || 0.43,
          rent_model: prevYearData.rent_model || { type: 'fixed', amount: 8000000 }
        };
      } else {
        // First year defaults
        yearAssumptions = {
          students: { french: 850, ib: 100 },
          tuition: { french: 82000, ib: 95000 },
          other_income: 5500000,
          staff_cost_pct: 0.42,
          opex_pct: 0.43,
          rent_model: { type: 'fixed', amount: 8000000 }
        };
      }
    }

    // REVENUE CALCULATION
    const frenchRevenue = (yearAssumptions.students?.french || 0) * (yearAssumptions.tuition?.french || 0);
    const ibRevenue = (yearAssumptions.students?.ib || 0) * (yearAssumptions.tuition?.ib || 0);
    const tuitionRevenue = frenchRevenue + ibRevenue;
    const otherIncome = yearAssumptions.other_income || 0;
    const totalRevenues = tuitionRevenue + otherIncome;

    results.revenue_streams[yearStr] = {
      french_tuition: frenchRevenue,
      ib_tuition: ibRevenue,
      total_tuition: tuitionRevenue,
      other_income: otherIncome,
      total_revenues: totalRevenues
    };

    // EXPENSES CALCULATION
    const staffCosts = totalRevenues * (yearAssumptions.staff_cost_pct || 0.42);
    const otherOpex = totalRevenues * (yearAssumptions.opex_pct || 0.43);
    const rent = yearAssumptions.rent_model?.amount || 8000000;
    const depreciation = depreciationSchedule[yearStr] || 0;
    const totalOperatingExpenses = staffCosts + otherOpex + rent;
    
    // P&L
    const ebitda = totalRevenues - totalOperatingExpenses;
    const ebit = ebitda - depreciation;
    const netResult = ebit; // Simplified - no tax/interest for now

    results.profit_loss[yearStr] = {
      total_revenues: totalRevenues,
      staff_costs: staffCosts,
      other_opex: otherOpex,
      rent: rent,
      total_operating_expenses: totalOperatingExpenses,
      ebitda: ebitda,
      depreciation: depreciation,
      ebit: ebit,
      net_result: netResult
    };

    // BALANCE SHEET
    // Working capital calculations
    const arDays = wc.ar_days || 50;
    const apDays = wc.ap_days || 30;
    const deferredPct = wc.deferred_pct || 0.12;
    const inventoryDays = wc.inventory_days || 10;

    const accountsReceivable = (totalRevenues / 365) * arDays;
    const accountsPayable = (totalOperatingExpenses / 365) * apDays;
    const deferredIncome = totalRevenues * deferredPct;
    const inventory = (totalOperatingExpenses / 365) * inventoryDays;

    // CAPEX for this year
    const capexThisYear = capexTable.find((c: any) => String(c.year) === yearStr)?.amount || 0;
    
    // PPE calculation
    const ppeGross = prevPPE + capexThisYear;
    const ppeNet = ppeGross - depreciation;

    // Cash flow calculation (simplified)
    const operatingCashFlow = netResult + depreciation;
    const workingCapitalChange = (accountsReceivable - prevAR) - (accountsPayable - prevAP) + (inventory - prevInventory);
    const investingCashFlow = -capexThisYear;
    const netCashFlow = operatingCashFlow - workingCapitalChange + investingCashFlow;
    const cash = prevCash + netCashFlow;

    // Equity
    const equity = prevEquity + netResult;

    // Assets & Liabilities
    const totalAssets = cash + accountsReceivable + inventory + ppeNet;
    const provisions = openingBS['2024']?.provisions || 2000000;
    const totalLiabilities = accountsPayable + deferredIncome + provisions;
    const totalLiabEquity = totalLiabilities + equity;

    results.balance_sheet[yearStr] = {
      cash: cash,
      accounts_receivable: accountsReceivable,
      inventory: inventory,
      ppe_net: ppeNet,
      total_assets: totalAssets,
      accounts_payable: accountsPayable,
      deferred_income: deferredIncome,
      provisions: provisions,
      total_liabilities: totalLiabilities,
      equity: equity,
      total_liab_equity: totalLiabEquity
    };

    // CASH FLOW
    results.cash_flow[yearStr] = {
      operating_cash_flow: operatingCashFlow,
      working_capital_change: workingCapitalChange,
      investing_cash_flow: investingCashFlow,
      financing_cash_flow: 0,
      net_cash_flow: netCashFlow
    };

    // CONTROLS
    const difference = totalAssets - totalLiabEquity;
    const status = Math.abs(difference) < 1000 ? 'OK' : 'CHECK';
    
    results.controls.balance_sheet_parity[yearStr] = {
      assets: totalAssets.toFixed(0),
      liab_equity: totalLiabEquity.toFixed(0),
      difference: difference.toFixed(0),
      status: status
    };

    // RATIOS
    results.ratios[yearStr] = {
      ebitda_margin_pct: ((ebitda / totalRevenues) * 100).toFixed(2),
      net_margin_pct: ((netResult / totalRevenues) * 100).toFixed(2),
      current_ratio: (totalAssets / totalLiabilities).toFixed(2),
      cash_to_revenue: ((cash / totalRevenues) * 100).toFixed(2)
    };

    // Update previous values for next iteration
    prevCash = cash;
    prevAR = accountsReceivable;
    prevInventory = inventory;
    prevPPE = ppeNet;
    prevAP = accountsPayable;
    prevDeferred = deferredIncome;
    prevEquity = equity;
  }

  return results;
}
