import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        return new Response(
          JSON.stringify({ message: 'Token expired' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get n8n webhook configuration
    const n8nWebhookUrl = Deno.env.get('N8N_REFRESH_WEBHOOK_URL');
    const n8nSecret = Deno.env.get('N8N_REFRESH_SECRET');

    if (!n8nWebhookUrl || !n8nSecret) {
      console.error('n8n webhook configuration missing');
      return new Response(
        JSON.stringify({ message: 'Refresh service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling n8n webhook...');

    // Call n8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': n8nSecret,
      },
      body: JSON.stringify({ action: 'refresh' }),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('n8n webhook failed:', n8nResponse.status, errorText);
      return new Response(
        JSON.stringify({ message: 'Failed to refresh data from automation service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newPayload = await n8nResponse.json();
    console.log('n8n response received');

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update dashboard cache
    const updatedAt = newPayload.updated_at || new Date().toISOString();
    
    const { error } = await supabase
      .from('dashboard_cache')
      .upsert({
        id: 1,
        payload: newPayload,
        updated_at: updatedAt,
      });

    if (error) {
      console.error('Failed to update cache:', error);
      return new Response(
        JSON.stringify({ message: 'Failed to save updated data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Dashboard cache updated successfully');
    return new Response(
      JSON.stringify(newPayload),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Refresh error:', error);
    return new Response(
      JSON.stringify({ message: 'Failed to refresh dashboard data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
