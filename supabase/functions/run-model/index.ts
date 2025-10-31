// Financial Planning Calculation Engine
// Performs 25-year projections with P&L, Balance Sheet, Cash Flow, and Controls

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { versionName, versionType, assumptions } = await req.json();

    if (!versionName || !assumptions) {
      throw new Error('Version name and assumptions are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': serviceRoleKey }
    });

    if (!userResponse.ok) {
      throw new Error('Invalid token');
    }

    const userData = await userResponse.json();
    const userId = userData.id;

    // Calculate years array (2024-2052)
    const startYear = 2024;
    const endYear = 2052;
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    // 1. Calculate Revenue Streams
    const revenueStreams = calculateRevenueStreams(years, assumptions);

    // 2. Calculate Profit & Loss
    const profitLoss = calculateProfitLoss(years, assumptions, revenueStreams);

    // 3. Calculate Balance Sheet
    const balanceSheet = calculateBalanceSheet(years, assumptions, profitLoss);

    // 4. Calculate Cash Flow
    const cashFlow = calculateCashFlow(years, profitLoss, balanceSheet, assumptions);

    // 5. Perform Control Checks
    const controls = performControlChecks(years, balanceSheet, cashFlow);

    // 6. Calculate Ratios & KPIs
    const ratios = calculateRatios(years, profitLoss, balanceSheet, cashFlow, revenueStreams, assumptions);

    // Create version record
    const versionData = {
      name: versionName,
      version_type: versionType || 'base',
      created_by: userId,
      metadata: {
        planning_horizon: { start: startYear, end: endYear },
        calculated_at: new Date().toISOString()
      }
    };

    const versionResponse = await fetch(`${supabaseUrl}/rest/v1/versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(versionData)
    });

    if (!versionResponse.ok) {
      const errorText = await versionResponse.text();
      throw new Error(`Failed to create version: ${errorText}`);
    }

    const versions = await versionResponse.json();
    const version = versions[0];

    // Save assumptions
    const assumptionsData = {
      version_id: version.id,
      ...assumptions
    };

    await fetch(`${supabaseUrl}/rest/v1/assumptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assumptionsData)
    });

    // Save results
    const resultsData = {
      version_id: version.id,
      revenue_streams: revenueStreams,
      profit_loss: profitLoss,
      balance_sheet: balanceSheet,
      cash_flow: cashFlow,
      controls: controls,
      ratios: ratios
    };

    await fetch(`${supabaseUrl}/rest/v1/results`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resultsData)
    });

    // Log audit trail
    await fetch(`${supabaseUrl}/rest/v1/audit_trails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        version_id: version.id,
        action_type: 'create',
        action_description: `Created version: ${versionName}`,
        metadata: { version_type: versionType }
      })
    });

    return new Response(JSON.stringify({
      data: {
        version_id: version.id,
        version_name: versionName,
        results: {
          revenue_streams: revenueStreams,
          profit_loss: profitLoss,
          balance_sheet: balanceSheet,
          cash_flow: cashFlow,
          controls: controls,
          ratios: ratios
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Calculation error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'CALCULATION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Calculate revenue streams for all years
function calculateRevenueStreams(years, assumptions) {
  const streams = {};
  
  years.forEach(year => {
    const yearStr = year.toString();
    let studentsFrench, studentsIB, tuitionFrench, tuitionIB, otherIncome;

    // Get assumptions for this year
    if (assumptions.strategic_near_term && assumptions.strategic_near_term[yearStr]) {
      const yearData = assumptions.strategic_near_term[yearStr];
      studentsFrench = yearData.students?.french || 0;
      studentsIB = yearData.students?.ib || 0;
      tuitionFrench = yearData.tuition?.french || 0;
      tuitionIB = yearData.tuition?.ib || 0;
      otherIncome = yearData.other_income || 0;
    } else if (assumptions.strategic_long_term && assumptions.strategic_long_term[yearStr]) {
      const yearData = assumptions.strategic_long_term[yearStr];
      studentsFrench = yearData.students?.french || 0;
      studentsIB = yearData.students?.ib || 0;
      tuitionFrench = yearData.tuition?.french || 0;
      tuitionIB = yearData.tuition?.ib || 0;
      otherIncome = yearData.other_income || 0;
    } else {
      // Use previous year with growth rate if available
      const prevYear = (year - 1).toString();
      if (streams[prevYear]) {
        const prevData = streams[prevYear];
        const growthRate = assumptions.default_growth_rate || 0.05;
        studentsFrench = Math.round(prevData.students_french * (1 + growthRate));
        studentsIB = Math.round(prevData.students_ib * (1 + growthRate));
        tuitionFrench = prevData.tuition_french * (1 + growthRate);
        tuitionIB = prevData.tuition_ib * (1 + growthRate);
        otherIncome = prevData.other_income * (1 + growthRate);
      } else {
        studentsFrench = 0;
        studentsIB = 0;
        tuitionFrench = 0;
        tuitionIB = 0;
        otherIncome = 0;
      }
    }

    const revenueFrench = studentsFrench * tuitionFrench;
    const revenueIB = studentsIB * tuitionIB;
    const totalRevenue = revenueFrench + revenueIB + otherIncome;

    streams[yearStr] = {
      students_french: studentsFrench,
      students_ib: studentsIB,
      total_students: studentsFrench + studentsIB,
      tuition_french: tuitionFrench,
      tuition_ib: tuitionIB,
      revenue_french: revenueFrench,
      revenue_ib: revenueIB,
      other_income: otherIncome,
      total_revenue: totalRevenue
    };
  });

  return streams;
}

// Calculate P&L for all years
function calculateProfitLoss(years, assumptions, revenueStreams) {
  const pnl = {};

  years.forEach(year => {
    const yearStr = year.toString();
    const revenue = revenueStreams[yearStr]?.total_revenue || 0;

    // Get cost assumptions for this year
    let staffCostPct = 0.42;
    let opexPct = 0.43;
    let rentAmount = 8000000;
    let depreciation = 0;

    if (assumptions.strategic_near_term && assumptions.strategic_near_term[yearStr]) {
      const yearData = assumptions.strategic_near_term[yearStr];
      staffCostPct = yearData.staff_cost_pct || staffCostPct;
      opexPct = yearData.opex_pct || opexPct;
      rentAmount = yearData.rent_model?.amount || rentAmount;
    }

    // Calculate CAPEX depreciation for this year
    if (assumptions.capex_table && Array.isArray(assumptions.capex_table)) {
      assumptions.capex_table.forEach(capex => {
        const capexYear = parseInt(capex.year);
        const depPeriod = capex.depreciation_period || 10;
        if (year >= capexYear && year < capexYear + depPeriod) {
          depreciation += (capex.amount || 0) / depPeriod;
        }
      });
    }

    const salaries = -(revenue * staffCostPct);
    const otherExpenses = -(revenue * opexPct);
    const rent = -rentAmount;
    const totalOpex = salaries + otherExpenses + rent;
    const ebitda = revenue + totalOpex;
    const ebit = ebitda - depreciation;
    const interestIncome = revenue * 0.005; // Assuming 0.5% of revenue
    const netResult = ebit + interestIncome;

    pnl[yearStr] = {
      tuition_french: revenueStreams[yearStr]?.revenue_french || 0,
      tuition_ib: revenueStreams[yearStr]?.revenue_ib || 0,
      other_income: revenueStreams[yearStr]?.other_income || 0,
      total_revenues: revenue,
      salaries: salaries,
      rent: rent,
      other_expenses: otherExpenses,
      total_operating_expenses: totalOpex,
      ebitda: ebitda,
      depreciation: -depreciation,
      ebit: ebit,
      interest_income: interestIncome,
      interest_expense: 0,
      net_result: netResult
    };
  });

  return pnl;
}

// Calculate Balance Sheet for all years
function calculateBalanceSheet(years, assumptions, profitLoss) {
  const bs = {};

  years.forEach((year, index) => {
    const yearStr = year.toString();
    const prevYearStr = (year - 1).toString();

    if (year === 2024) {
      // Use opening balance sheet
      const opening = assumptions.opening_balance_sheet || {};
      bs[yearStr] = opening['2024'] || {
        cash: 18250072,
        accounts_receivable: 9800000,
        inventory: 500000,
        ppe_net: 20000000,
        total_assets: 48550072,
        accounts_payable: 5000000,
        deferred_income: 8000000,
        provisions: 2000000,
        total_liabilities: 15000000,
        equity: 33550072,
        total_liab_equity: 48550072
      };
    } else {
      // Roll forward from previous year
      const prevBS = bs[prevYearStr];
      const netResult = profitLoss[yearStr]?.net_result || 0;
      const depreciation = -(profitLoss[yearStr]?.depreciation || 0);
      
      // Calculate working capital changes
      const wcDays = assumptions.working_capital || {};
      const revenue = profitLoss[yearStr]?.total_revenues || 0;
      
      const arDays = wcDays.ar_days || 50;
      const apDays = wcDays.ap_days || 30;
      const deferredPct = wcDays.deferred_pct || 0.12;
      
      const ar = (revenue * arDays) / 365;
      const ap = (Math.abs(profitLoss[yearStr]?.total_operating_expenses || 0) * apDays) / 365;
      const deferredIncome = revenue * deferredPct;

      // Calculate CAPEX for this year
      let capexThisYear = 0;
      if (assumptions.capex_table && Array.isArray(assumptions.capex_table)) {
        capexThisYear = assumptions.capex_table
          .filter(capex => parseInt(capex.year) === year)
          .reduce((sum, capex) => sum + (capex.amount || 0), 0);
      }

      const cash = prevBS.cash + netResult + depreciation - capexThisYear;
      const ppeNet = prevBS.ppe_net + capexThisYear - depreciation;
      const totalAssets = cash + ar + (prevBS.inventory || 500000) + ppeNet;
      const totalLiab = ap + deferredIncome + (prevBS.provisions || 2000000);
      const equity = prevBS.equity + netResult;

      bs[yearStr] = {
        cash: cash,
        accounts_receivable: ar,
        inventory: prevBS.inventory || 500000,
        ppe_net: ppeNet,
        total_assets: totalAssets,
        accounts_payable: ap,
        deferred_income: deferredIncome,
        provisions: prevBS.provisions || 2000000,
        total_liabilities: totalLiab,
        equity: equity,
        total_liab_equity: totalLiab + equity
      };
    }
  });

  return bs;
}

// Calculate Cash Flow for all years
function calculateCashFlow(years, profitLoss, balanceSheet, assumptions) {
  const cf = {};

  years.forEach((year, index) => {
    const yearStr = year.toString();
    const prevYearStr = (year - 1).toString();

    if (year === 2024) {
      // Base year
      cf[yearStr] = {
        opening_cash: balanceSheet[yearStr]?.cash || 0,
        net_result: profitLoss[yearStr]?.net_result || 0,
        depreciation: -(profitLoss[yearStr]?.depreciation || 0),
        wc_change: 0,
        operating_cf: (profitLoss[yearStr]?.net_result || 0) + (-(profitLoss[yearStr]?.depreciation || 0)),
        capex: 0,
        investing_cf: 0,
        financing_cf: 0,
        net_cash_change: (profitLoss[yearStr]?.net_result || 0) + (-(profitLoss[yearStr]?.depreciation || 0)),
        ending_cash: balanceSheet[yearStr]?.cash || 0
      };
    } else {
      const prevBS = balanceSheet[prevYearStr];
      const currBS = balanceSheet[yearStr];
      
      const openingCash = prevBS.cash;
      const netResult = profitLoss[yearStr]?.net_result || 0;
      const depreciation = -(profitLoss[yearStr]?.depreciation || 0);
      
      // Working capital change
      const wcChange = (prevBS.accounts_receivable - currBS.accounts_receivable) +
                       (prevBS.inventory - currBS.inventory) -
                       (prevBS.accounts_payable - currBS.accounts_payable) -
                       (prevBS.deferred_income - currBS.deferred_income);
      
      const operatingCF = netResult + depreciation + wcChange;
      
      // CAPEX
      let capex = 0;
      if (assumptions.capex_table && Array.isArray(assumptions.capex_table)) {
        capex = -assumptions.capex_table
          .filter(c => parseInt(c.year) === year)
          .reduce((sum, c) => sum + (c.amount || 0), 0);
      }
      
      const investingCF = capex;
      const financingCF = 0;
      const netCashChange = operatingCF + investingCF + financingCF;
      const endingCash = openingCash + netCashChange;

      cf[yearStr] = {
        opening_cash: openingCash,
        net_result: netResult,
        depreciation: depreciation,
        wc_change: wcChange,
        operating_cf: operatingCF,
        capex: capex,
        investing_cf: investingCF,
        financing_cf: financingCF,
        net_cash_change: netCashChange,
        ending_cash: endingCash
      };
    }
  });

  return cf;
}

// Perform control checks
function performControlChecks(years, balanceSheet, cashFlow) {
  const controls = {
    balance_sheet_parity: {},
    cash_flow_reconciliation: {}
  };

  years.forEach(year => {
    const yearStr = year.toString();
    const bs = balanceSheet[yearStr];
    const cf = cashFlow[yearStr];

    // Balance Sheet Parity Check
    const assets = bs.total_assets / 1000000; // Convert to M SAR
    const liabEquity = bs.total_liab_equity / 1000000;
    const bsDiff = Math.round((assets - liabEquity) * 1000) / 1000;
    const bsStatus = Math.abs(bsDiff) <= 0.001 ? 'OK' : 'WARNING';

    controls.balance_sheet_parity[yearStr] = {
      assets: Math.round(assets * 1000) / 1000,
      liab_equity: Math.round(liabEquity * 1000) / 1000,
      difference: bsDiff,
      status: bsStatus
    };

    // Cash Flow Reconciliation
    const cfCash = cf.ending_cash / 1000000;
    const bsCash = bs.cash / 1000000;
    const cfDiff = Math.round((cfCash - bsCash) * 1000) / 1000;
    const cfStatus = Math.abs(cfDiff) <= 0.001 ? 'OK' : 'WARNING';

    controls.cash_flow_reconciliation[yearStr] = {
      cf_ending_cash: Math.round(cfCash * 1000) / 1000,
      bs_cash: Math.round(bsCash * 1000) / 1000,
      difference: cfDiff,
      status: cfStatus
    };
  });

  return controls;
}

// Calculate ratios and KPIs
function calculateRatios(years, profitLoss, balanceSheet, cashFlow, revenueStreams, assumptions) {
  const ratios = {};

  years.forEach(year => {
    const yearStr = year.toString();
    const pnl = profitLoss[yearStr];
    const bs = balanceSheet[yearStr];
    const cf = cashFlow[yearStr];
    const revenue = revenueStreams[yearStr];

    const totalRevenue = pnl.total_revenues || 1;
    const totalStudents = revenue.total_students || 1;

    ratios[yearStr] = {
      // Profitability
      ebitda_margin: ((pnl.ebitda / totalRevenue) * 100).toFixed(2),
      net_margin: ((pnl.net_result / totalRevenue) * 100).toFixed(2),
      staff_cost_pct: ((Math.abs(pnl.salaries) / totalRevenue) * 100).toFixed(2),
      opex_pct: ((Math.abs(pnl.total_operating_expenses) / totalRevenue) * 100).toFixed(2),
      rent_pct: ((Math.abs(pnl.rent) / totalRevenue) * 100).toFixed(2),

      // Productivity
      revenue_per_student: ((totalRevenue / totalStudents) / 1000000).toFixed(3),
      opex_per_student: ((Math.abs(pnl.total_operating_expenses) / totalStudents) / 1000000).toFixed(3),

      // Liquidity
      operating_cf_pct: ((cf.operating_cf / totalRevenue) * 100).toFixed(2),
      cash_balance: (bs.cash / 1000000).toFixed(3),
      deferred_income_pct: ((bs.deferred_income / totalRevenue) * 100).toFixed(2),

      // Balance Sheet Health
      current_ratio: ((bs.cash + bs.accounts_receivable) / (bs.accounts_payable + bs.deferred_income)).toFixed(2),
      cash_to_current_liab: (bs.cash / (bs.accounts_payable + bs.deferred_income)).toFixed(2),
      provisions_pct: ((bs.provisions / bs.total_liabilities) * 100).toFixed(2)
    };
  });

  // Calculate CAGR for 5-year periods
  const latestYear = years[years.length - 1].toString();
  const fiveYearsAgo = (years[years.length - 1] - 5).toString();
  
  if (profitLoss[fiveYearsAgo] && profitLoss[latestYear]) {
    const revenueStart = profitLoss[fiveYearsAgo].total_revenues;
    const revenueEnd = profitLoss[latestYear].total_revenues;
    const revenueCagr = (Math.pow(revenueEnd / revenueStart, 1/5) - 1) * 100;
    
    const studentsStart = revenueStreams[fiveYearsAgo].total_students;
    const studentsEnd = revenueStreams[latestYear].total_students;
    const studentsCagr = (Math.pow(studentsEnd / studentsStart, 1/5) - 1) * 100;

    ratios['summary'] = {
      revenue_cagr_5y: revenueCagr.toFixed(2),
      students_cagr_5y: studentsCagr.toFixed(2)
    };
  }

  return ratios;
}
