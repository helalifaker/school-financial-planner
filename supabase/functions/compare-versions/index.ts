// Compare Versions
// Benchmarks two or more versions and calculates variance

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
    const { versionIds } = await req.json();

    if (!versionIds || !Array.isArray(versionIds) || versionIds.length < 2) {
      throw new Error('At least 2 version IDs are required for comparison');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Fetch all versions and their results
    const versionsData = [];

    for (const versionId of versionIds) {
      // Get version info
      const versionResponse = await fetch(
        `${supabaseUrl}/rest/v1/versions?id=eq.${versionId}&select=*`,
        {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        }
      );

      const versions = await versionResponse.json();
      if (!versions || versions.length === 0) {
        throw new Error(`Version ${versionId} not found`);
      }

      // Get results
      const resultsResponse = await fetch(
        `${supabaseUrl}/rest/v1/results?version_id=eq.${versionId}&select=*`,
        {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        }
      );

      const results = await resultsResponse.json();

      versionsData.push({
        version: versions[0],
        results: results.length > 0 ? results[0] : null
      });
    }

    // Calculate variances
    const baseVersion = versionsData[0];
    const comparisons = [];

    for (let i = 1; i < versionsData.length; i++) {
      const compareVersion = versionsData[i];
      const variance = calculateVariance(baseVersion.results, compareVersion.results);

      comparisons.push({
        base_version: {
          id: baseVersion.version.id,
          name: baseVersion.version.name,
          type: baseVersion.version.version_type
        },
        compare_version: {
          id: compareVersion.version.id,
          name: compareVersion.version.name,
          type: compareVersion.version.version_type
        },
        variance: variance
      });
    }

    return new Response(JSON.stringify({
      data: {
        versions: versionsData.map(v => ({
          id: v.version.id,
          name: v.version.name,
          type: v.version.version_type,
          created_at: v.version.created_at
        })),
        comparisons: comparisons
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Compare versions error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'COMPARISON_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Calculate variance between two result sets
function calculateVariance(baseResults, compareResults) {
  const variance = {
    revenue_variance: {},
    profit_loss_variance: {},
    balance_sheet_variance: {},
    ratios_variance: {}
  };

  // Compare key metrics for each year
  if (baseResults?.profit_loss && compareResults?.profit_loss) {
    const years = Object.keys(baseResults.profit_loss);
    
    years.forEach(year => {
      const basePnL = baseResults.profit_loss[year];
      const comparePnL = compareResults.profit_loss[year];

      if (basePnL && comparePnL) {
        const revenueBase = basePnL.total_revenues || 0;
        const revenueCompare = comparePnL.total_revenues || 0;
        const revenueVariance = revenueCompare - revenueBase;
        const revenueVariancePct = revenueBase !== 0 ? 
          ((revenueVariance / revenueBase) * 100).toFixed(2) : 'N/A';

        const ebitdaBase = basePnL.ebitda || 0;
        const ebitdaCompare = comparePnL.ebitda || 0;
        const ebitdaVariance = ebitdaCompare - ebitdaBase;
        const ebitdaVariancePct = ebitdaBase !== 0 ? 
          ((ebitdaVariance / ebitdaBase) * 100).toFixed(2) : 'N/A';

        const netResultBase = basePnL.net_result || 0;
        const netResultCompare = comparePnL.net_result || 0;
        const netResultVariance = netResultCompare - netResultBase;
        const netResultVariancePct = netResultBase !== 0 ? 
          ((netResultVariance / netResultBase) * 100).toFixed(2) : 'N/A';

        variance.profit_loss_variance[year] = {
          revenue: {
            base: (revenueBase / 1000000).toFixed(3),
            compare: (revenueCompare / 1000000).toFixed(3),
            variance_msar: (revenueVariance / 1000000).toFixed(3),
            variance_pct: revenueVariancePct
          },
          ebitda: {
            base: (ebitdaBase / 1000000).toFixed(3),
            compare: (ebitdaCompare / 1000000).toFixed(3),
            variance_msar: (ebitdaVariance / 1000000).toFixed(3),
            variance_pct: ebitdaVariancePct
          },
          net_result: {
            base: (netResultBase / 1000000).toFixed(3),
            compare: (netResultCompare / 1000000).toFixed(3),
            variance_msar: (netResultVariance / 1000000).toFixed(3),
            variance_pct: netResultVariancePct
          }
        };
      }
    });
  }

  // Compare balance sheet metrics
  if (baseResults?.balance_sheet && compareResults?.balance_sheet) {
    const years = Object.keys(baseResults.balance_sheet);
    
    years.forEach(year => {
      const baseBS = baseResults.balance_sheet[year];
      const compareBS = compareResults.balance_sheet[year];

      if (baseBS && compareBS) {
        const cashBase = baseBS.cash || 0;
        const cashCompare = compareBS.cash || 0;
        const cashVariance = cashCompare - cashBase;

        const assetsBase = baseBS.total_assets || 0;
        const assetsCompare = compareBS.total_assets || 0;
        const assetsVariance = assetsCompare - assetsBase;

        variance.balance_sheet_variance[year] = {
          cash: {
            base: (cashBase / 1000000).toFixed(3),
            compare: (cashCompare / 1000000).toFixed(3),
            variance_msar: (cashVariance / 1000000).toFixed(3)
          },
          total_assets: {
            base: (assetsBase / 1000000).toFixed(3),
            compare: (assetsCompare / 1000000).toFixed(3),
            variance_msar: (assetsVariance / 1000000).toFixed(3)
          }
        };
      }
    });
  }

  return variance;
}
