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
    const { version_id } = await req.json();
    
    if (!version_id) {
      throw new Error('version_id is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get version
    const versionResponse = await fetch(
      `${supabaseUrl}/rest/v1/versions?id=eq.${version_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!versionResponse.ok) {
      throw new Error('Failed to fetch version');
    }

    const versions = await versionResponse.json();
    if (versions.length === 0) {
      return new Response(
        JSON.stringify({ data: null }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const version = versions[0];

    // Get results
    const resultsResponse = await fetch(
      `${supabaseUrl}/rest/v1/results?version_id=eq.${version_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!resultsResponse.ok) {
      throw new Error('Failed to fetch results');
    }

    const resultsData = await resultsResponse.json();
    const results = resultsData.length > 0 ? resultsData[0] : null;

    // Get assumptions
    const assumptionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/assumptions?version_id=eq.${version_id}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    if (!assumptionsResponse.ok) {
      throw new Error('Failed to fetch assumptions');
    }

    const assumptionsData = await assumptionsResponse.json();
    const assumptions = assumptionsData.length > 0 ? assumptionsData[0] : null;

    return new Response(
      JSON.stringify({ 
        data: { 
          version, 
          results, 
          assumptions 
        } 
      }),
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
