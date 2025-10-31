// Get Version Details
// Retrieves complete version data including assumptions and results

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const versionId = url.searchParams.get('version_id');

    if (!versionId) {
      throw new Error('version_id parameter is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get version details
    const versionResponse = await fetch(
      `${supabaseUrl}/rest/v1/versions?id=eq.${versionId}&select=*`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (!versionResponse.ok) {
      throw new Error('Failed to fetch version');
    }

    const versions = await versionResponse.json();
    if (!versions || versions.length === 0) {
      throw new Error('Version not found');
    }

    const version = versions[0];

    // Get assumptions
    const assumptionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/assumptions?version_id=eq.${versionId}&select=*`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    const assumptions = await assumptionsResponse.json();

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

    return new Response(JSON.stringify({
      data: {
        version: version,
        assumptions: assumptions.length > 0 ? assumptions[0] : null,
        results: results.length > 0 ? results[0] : null
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get version error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'GET_VERSION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
