// List All Versions
// Returns all versions for the current user or all users (if admin)

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Get all versions ordered by creation date
    const versionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/versions?select=*&order=created_at.desc`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (!versionsResponse.ok) {
      throw new Error('Failed to fetch versions');
    }

    const versions = await versionsResponse.json();

    // Get creator names for each version
    const creatorIds = [...new Set(versions.map(v => v.created_by))];
    const profiles = [];

    for (const creatorId of creatorIds) {
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${creatorId}&select=id,full_name,email`,
        {
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey
          }
        }
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.length > 0) {
          profiles.push(profileData[0]);
        }
      }
    }

    // Enrich versions with creator info
    const enrichedVersions = versions.map(version => ({
      ...version,
      creator: profiles.find(p => p.id === version.created_by) || {
        full_name: 'Unknown',
        email: ''
      }
    }));

    return new Response(JSON.stringify({
      data: enrichedVersions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('List versions error:', error);
    return new Response(JSON.stringify({
      error: {
        code: 'LIST_VERSIONS_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
