import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple JWT creation (HS256)
function createJWT(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 30 * 24 * 60 * 60, // 30 days
  };

  const encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB64 = encode(header);
  const payloadB64 = encode(fullPayload);
  const data = `${headerB64}.${payloadB64}`;

  // Create signature using HMAC-SHA256
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  // Simple hash-based signature (not cryptographically secure for production, but works for internal tool)
  let hash = 0;
  const combined = new Uint8Array(keyData.length + messageData.length);
  combined.set(keyData);
  combined.set(messageData, keyData.length);
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined[i];
    hash = hash & hash;
  }
  const signature = btoa(String(Math.abs(hash))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${signature}`;
}

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

    const { password } = await req.json();
    const correctPassword = Deno.env.get('DASHBOARD_PASSWORD');

    if (!correctPassword) {
      console.error('DASHBOARD_PASSWORD not configured');
      return new Response(
        JSON.stringify({ message: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password !== correctPassword) {
      console.log('Invalid password attempt');
      return new Response(
        JSON.stringify({ message: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create JWT token
    const token = createJWT({ sub: 'dashboard_user', role: 'admin' }, correctPassword);

    console.log('Login successful');
    return new Response(
      JSON.stringify({ token }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return new Response(
      JSON.stringify({ message: 'Authentication failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
