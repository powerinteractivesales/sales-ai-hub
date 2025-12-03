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
    if (req.method !== 'GET') {
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

    // Get lead ID from query params
    const url = new URL(req.url);
    const leadId = url.searchParams.get('id');

    if (!leadId) {
      return new Response(
        JSON.stringify({ message: 'Lead ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lead details
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', parseInt(leadId))
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ message: 'Failed to fetch lead data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ message: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map database columns to expected format
    const lead = {
      id: data.id,
      meta_lead_id: data.meta_lead_id,
      name: data.name,
      email: data.email,
      company: data['Company name'] || '',
      phone: data['Phone_number'] || '',
      country: data.country || '',
      status: data.status || '',
      master_status: data.master_status || '',
      average_score: data.average_score || 0,
      persona_fit: data.persona_fit || 0,
      activation_fit: data.activation_fit || 0,
      intent_score: data.intent_score || 0,
      ad_id: data['Ad_ID'] || 0,
      ad_name: data['Ad Name'] || '',
      where: data['where?'] || '',
      what_matters: data['what matters?'] || '',
      experience_with_technology: data['experience with technology'] || '',
      last_contact_timestamp: data.last_contact_timestamp,
      next_followup_timestamp: data.next_followup_timestamp,
      conversation_history: data.conversation_history || '',
    };

    console.log('Lead fetched successfully:', leadId);
    return new Response(
      JSON.stringify(lead),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Leads error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
