import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to check if ID is UUID (website lead) or numeric (meta lead)
function isUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

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

    let data, error, leadSource;

    // Determine which table to query based on ID format
    if (isUUID(leadId)) {
      // Website lead - query Website_Lead_Tracker
      console.log('Fetching website lead:', leadId);
      leadSource = 'Website';

      const result = await supabase
        .from('Website_Lead_Tracker')
        .select('*')
        .eq('id', leadId)
        .maybeSingle();

      data = result.data;
      error = result.error;

      if (data) {
        // Map Website_Lead_Tracker columns to standard format
        const lead = {
          id: data.id,
          meta_lead_id: null,
          name: `${data.first_name} ${data.last_name}`.trim(),
          email: data.email,
          company: null,
          phone: data.phone_number || '',
          country: null,
          status: data.status || '',
          master_status: data.master_status || '',
          average_score: null,
          persona_fit: null,
          activation_fit: null,
          intent_score: null,
          ad_id: null,
          ad_name: null,
          where: null,
          what_matters: null,
          experience_with_technology: null,
          last_contact_timestamp: data.created_at,
          next_followup_timestamp: data.Next_Followup_Time,
          conversation_history: data.conversation_history || '',
          lead_source: 'Website',
          initial_message: data.message || '',
          assigned_to: data.assigned_to || null,
        };

        console.log('Website lead fetched successfully');
        return new Response(
          JSON.stringify(lead),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Meta lead - query LeadTracker
      console.log('Fetching meta lead:', leadId);
      leadSource = 'Meta';

      const result = await supabase
        .from('LeadTracker')
        .select('*')
        .eq('id', parseInt(leadId))
        .maybeSingle();

      data = result.data;
      error = result.error;

      if (data) {
        // Map LeadTracker columns to standard format
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
          lead_source: 'Meta',
          initial_message: null,
          assigned_to: data.assigned_to || null,
        };

        console.log('Meta lead fetched successfully');
        return new Response(
          JSON.stringify(lead),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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
  } catch (error) {
    console.error('Leads error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
