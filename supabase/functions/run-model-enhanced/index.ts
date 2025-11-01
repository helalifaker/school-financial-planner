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

    // Calculate financial model with historical data and enhancements
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
        ratios: results.ratios,
        historical_data: results.historical_data
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
  const startYear = 2025;
  const endYear = assumptions.general_setup?.planning_horizon?.end || 2052;
  const nearTerm = assumptions.strategic_near_term || {};
  const longTerm = assumptions.strategic_long_term || {};
  const capexTable = assumptions.capex_table || [];
  const wc = assumptions.working_capital || {};
  const openingBS = assumptions.opening_balance_sheet || {};
  
  const results: any = {
    historical_data: getHistoricalData(),
    revenue_streams: {},
    profit_loss: {},
    balance_sheet: {},
    cash_flow: {},
    controls: { balance_sheet_parity: {} },
    ratios: {}
  };

  // Initialize from 2024 base year (from historical data)
  let prevCash = 18250072;
  let prevAR = 14301148;
  let prevPrepaid = 3999;
  let prevLoans = 106000;
  let prevPPEGross = 79763893;
  let prevAccumDep = 43538150;
  let prevAP = 4087609;
  let prevAccrued = 204597;
  let prevDeferred = 23726112;
  let prevProvisions = 31149512;
  let prevEquity = 9718524; // Retained earnings + net result from 2024

  // Track depreciation schedule
  const depreciationSchedule: any = {};

  // Process CAPEX for depreciation schedule
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

  // Calculate for each year from 2025-2052
  for (let year = startYear; year <= endYear; year++) {
    const yearStr = String(year);
    
    // Get assumptions for this year
    let yearAssumptions;
    if (nearTerm[yearStr]) {
      yearAssumptions = nearTerm[yearStr];
    } else if (longTerm[yearStr]) {
      yearAssumptions = longTerm[yearStr];
    } else {
      // Use previous year with default growth
      const prevYear = String(year - 1);
      const defaultGrowth = 0.05;
      const prevYearData = nearTerm[prevYear] || longTerm[prevYear] || nearTerm['2027'];
      
      if (prevYearData) {
        yearAssumptions = {
          students: {
            french: Math.round((prevYearData.students?.french || 1480) * (1 + defaultGrowth)),
            ib: Math.round((prevYearData.students?.ib || 370) * (1 + defaultGrowth))
          },
          tuition: {
            french: Math.round((prevYearData.tuition?.french || 35000) * (1 + defaultGrowth)),
            ib: Math.round((prevYearData.tuition?.ib || 47000) * (1 + defaultGrowth))
          },
          other_income: Math.round((prevYearData.other_income || 5500000) * (1 + defaultGrowth)),
          staff_cost_pct: prevYearData.staff_cost_pct || 0.42,
          opex_pct: prevYearData.opex_pct || 0.20,
          other_expenses_pct: prevYearData.other_expenses_pct || 0.35,
          rent_model: prevYearData.rent_model || { type: 'fixed', amount: 7631145 }
        };
      } else {
        yearAssumptions = {
          students: { french: 1394, ib: 348 },
          tuition: { french: 33213, ib: 44284 },
          other_income: 5016000,
          staff_cost_pct: 0.42,
          opex_pct: 0.20,
          other_expenses_pct: 0.35,
          rent_model: { type: 'fixed', amount: 7631145 }
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
    const otherOpex = totalRevenues * (yearAssumptions.opex_pct || 0.20);
    const otherExpenses = totalRevenues * (yearAssumptions.other_expenses_pct || 0.35);
    const rent = yearAssumptions.rent_model?.amount || 7631145;
    const depreciation = depreciationSchedule[yearStr] || 3612073;
    const totalOperatingExpenses = staffCosts + otherOpex + otherExpenses + rent;
    
    // P&L
    const ebitda = totalRevenues - totalOperatingExpenses;
    const ebit = ebitda - depreciation;
    const interestIncome = totalRevenues * 0.006; // Approximately 0.6% based on historical
    const netResult = ebit + interestIncome;

    results.profit_loss[yearStr] = {
      total_revenues: totalRevenues,
      staff_costs: staffCosts,
      other_opex: otherOpex,
      other_expenses: otherExpenses,
      rent: rent,
      total_operating_expenses: totalOperatingExpenses,
      ebitda: ebitda,
      depreciation: depreciation,
      ebit: ebit,
      interest_income: interestIncome,
      net_result: netResult
    };

    // BALANCE SHEET with 3 Asset Categories
    // Working capital calculations
    const arDays = wc.ar_days || 50;
    const apDays = wc.ap_days || 30;
    const deferredPct = wc.deferred_pct || 0.34; // Based on historical 23.7M / 70.5M
    const inventoryDays = wc.inventory_days || 10;

    const accountsReceivable = (totalRevenues / 365) * arDays;
    const accountsPayable = (totalOperatingExpenses / 365) * apDays;
    const deferredIncome = totalRevenues * deferredPct;
    const inventory = (totalOperatingExpenses / 365) * inventoryDays;
    const prepaidOther = 4000; // Minimal based on historical
    const loansAdvances = prevLoans; // Carry forward

    // CAPEX for this year
    const capexThisYear = capexTable.find((c: any) => String(c.year) === yearStr)?.amount || 0;
    
    // PPE calculation
    const ppeGross = prevPPEGross + capexThisYear;
    const accumDep = prevAccumDep + depreciation;
    const ppeNet = ppeGross - accumDep;

    // Cash flow calculation
    const operatingCashFlow = netResult + depreciation;
    const workingCapitalChange = (accountsReceivable - prevAR) - (accountsPayable - prevAP) + (inventory - 0) + (prepaidOther - prevPrepaid);
    const investingCashFlow = -capexThisYear;
    const financingCashFlow = 0;
    const netCashFlow = operatingCashFlow - workingCapitalChange + investingCashFlow + financingCashFlow;
    
    // Equity calculation
    const equity = prevEquity + netResult;
    
    // Liabilities
    const accruedExpenses = accountsPayable * 0.05; // Minimal accrued based on historical
    const provisions = prevProvisions * 1.15; // Growth with operations
    const totalCurrentLiabilities = accountsPayable + accruedExpenses + deferredIncome;
    const totalLiabilities = totalCurrentLiabilities + provisions;
    
    // CASH AS BALANCING VARIABLE
    // Calculate required assets and liabilities
    const receivableAndOthers = accountsReceivable + inventory + prepaidOther + loansAdvances;
    const tangibleIntangible = ppeNet;
    const nonCashAssets = receivableAndOthers + tangibleIntangible;
    const totalLiabEquity = totalLiabilities + equity;
    
    // Cash balances the equation: Assets = Liabilities + Equity
    const cash = totalLiabEquity - nonCashAssets;
    
    // Total assets
    const totalAssets = cash + nonCashAssets;

    results.balance_sheet[yearStr] = {
      // Category 1: Cash
      cash: cash,
      
      // Category 2: Receivable & Others
      accounts_receivable: accountsReceivable,
      inventory: inventory,
      prepaid_other: prepaidOther,
      loans_advances: loansAdvances,
      receivable_and_others_total: receivableAndOthers,
      
      // Category 3: Tangible/Intangible Assets
      ppe_gross: ppeGross,
      accumulated_depreciation: accumDep,
      ppe_net: ppeNet,
      tangible_intangible_total: tangibleIntangible,
      
      // Total Assets
      total_assets: totalAssets,
      
      // Liabilities
      accounts_payable: accountsPayable,
      accrued_expenses: accruedExpenses,
      deferred_income: deferredIncome,
      total_current_liabilities: totalCurrentLiabilities,
      provisions: provisions,
      total_liabilities: totalLiabilities,
      
      // Equity
      equity: equity,
      total_liab_equity: totalLiabEquity
    };

    // CASH FLOW
    results.cash_flow[yearStr] = {
      operating_cash_flow: operatingCashFlow,
      working_capital_change: workingCapitalChange,
      investing_cash_flow: investingCashFlow,
      financing_cash_flow: financingCashFlow,
      net_cash_flow: netCashFlow
    };

    // CONTROLS - Check balance sheet equation
    const difference = totalAssets - totalLiabEquity;
    const status = Math.abs(difference) < 100 ? 'OK' : 'CHECK';
    
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
      current_ratio: ((cash + receivableAndOthers) / totalCurrentLiabilities).toFixed(2),
      cash_to_revenue: ((cash / totalRevenues) * 100).toFixed(2)
    };

    // Update previous values for next iteration
    prevCash = cash;
    prevAR = accountsReceivable;
    prevPrepaid = prepaidOther;
    prevLoans = loansAdvances;
    prevPPEGross = ppeGross;
    prevAccumDep = accumDep;
    prevAP = accountsPayable;
    prevAccrued = accruedExpenses;
    prevDeferred = deferredIncome;
    prevProvisions = provisions;
    prevEquity = equity;
  }

  return results;
}

// Historical data from uploaded financial data (2023-2024)
function getHistoricalData() {
  return {
    '2023': {
      profit_loss: {
        french_tuition: 55819340,
        ib_tuition: 0,
        total_tuition: 55819340,
        other_income: 4373210,
        total_revenues: 60192550,
        staff_costs: 28460183,
        other_opex: 0, // Not separately broken out in historical
        other_expenses: 21816348,
        rent: 7939656,
        total_operating_expenses: 58216187,
        ebitda: 1976363,
        depreciation: 2360301,
        ebit: -383938,
        interest_income: 382960,
        interest_expenses: 0,
        net_result: -978
      },
      balance_sheet: {
        cash: 21580604,
        accounts_receivable: 9429976,
        inventory: 0,
        prepaid_other: 5500,
        loans_advances: 151750,
        receivable_and_others_total: 9587226,
        ppe_gross: 66811686,
        accumulated_depreciation: 39926077,
        ppe_net: 26885609,
        tangible_intangible_total: 26885609,
        total_assets: 58053439,
        accounts_payable: 3023457,
        accrued_expenses: 1791737,
        deferred_income: 21986734,
        total_current_liabilities: 26801928,
        provisions: 21535293,
        total_liabilities: 48337221,
        equity: 9716218,
        total_liab_equity: 58053439
      }
    },
    '2024': {
      profit_loss: {
        french_tuition: 65503278,
        ib_tuition: 0,
        total_tuition: 65503278,
        other_income: 5015995,
        total_revenues: 70519273,
        staff_costs: 29874321,
        other_opex: 0,
        other_expenses: 29830920,
        rent: 7631145,
        total_operating_expenses: 67336386,
        ebitda: 3182887,
        depreciation: 3612073,
        ebit: -429186,
        interest_income: 432479,
        interest_expenses: 0,
        net_result: 3293
      },
      balance_sheet: {
        cash: 18250072,
        accounts_receivable: 14301148,
        inventory: 0,
        prepaid_other: 3999,
        loans_advances: 106000,
        receivable_and_others_total: 14411147,
        ppe_gross: 79763893,
        accumulated_depreciation: 43538150,
        ppe_net: 36225743,
        tangible_intangible_total: 36225743,
        total_assets: 68886962,
        accounts_payable: 4087609,
        accrued_expenses: 204597,
        deferred_income: 23726112,
        total_current_liabilities: 28018318,
        provisions: 31149512,
        total_liabilities: 59167830,
        equity: 9719132,
        total_liab_equity: 68886962
      }
    }
  };
}
