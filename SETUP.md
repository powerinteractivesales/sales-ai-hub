# Sales AI Agent Dashboard - Setup Guide

This guide will help you set up and deploy the Sales AI Agent Dashboard.

## Architecture Overview

The application consists of:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno-based)
- **Database**: Supabase PostgreSQL
- **Integration**: n8n webhook for data refresh

## Prerequisites

1. A Supabase project (already created: `gwfkrtaqrgfosaqfcitq`)
2. Supabase CLI installed: `npm install -g supabase`
3. n8n instance with a webhook configured
4. Node.js 18+ and npm

## Database Setup

### Required Tables

Your Supabase project should have these two tables:

#### 1. `dashboard_cache`

```sql
CREATE TABLE dashboard_cache (
  id INT PRIMARY KEY DEFAULT 1,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial row
INSERT INTO dashboard_cache (id, payload, updated_at)
VALUES (1, '{"updated_at": "", "summary": {"total_leads": 0, "by_status": {}, "by_master_status": {}, "followups_due_now": 0, "followups_due_today": 0, "new_leads_last_24h": 0}, "leads": []}'::jsonb, NOW());
```

#### 2. `LeadTracker`

```sql
CREATE TABLE LeadTracker (
  id SERIAL PRIMARY KEY,
  meta_lead_id TEXT,
  name TEXT,
  email TEXT,
  "Company name" TEXT,
  "Phone_number" TEXT,
  country TEXT,
  status TEXT,
  master_status TEXT,
  average_score NUMERIC,
  persona_fit NUMERIC,
  activation_fit NUMERIC,
  intent_score NUMERIC,
  "Ad_ID" BIGINT,
  "Ad Name" TEXT,
  "where?" TEXT,
  "what matters?" TEXT,
  "experience with technology" TEXT,
  last_contact_timestamp TIMESTAMPTZ,
  next_followup_timestamp TIMESTAMPTZ,
  conversation_history TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_master_status ON LeadTracker(master_status);
CREATE INDEX idx_leads_status ON LeadTracker(status);
CREATE INDEX idx_leads_next_followup ON LeadTracker(next_followup_timestamp);
```

## Environment Variables

### Frontend (.env file)

The `.env` file in the root directory contains frontend environment variables:

```env
VITE_SUPABASE_URL=https://gwfkrtaqrgfosaqfcitq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

These are already configured for your project.

### Backend (Supabase Edge Functions Secrets)

**IMPORTANT**: Backend environment variables must be set in Supabase, NOT in the .env file.

#### Automatic Variables (DO NOT SET THESE)

Supabase automatically provides these variables to Edge Functions:
- ✅ `SUPABASE_URL` - Automatically available
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Automatically available
- ✅ `SUPABASE_ANON_KEY` - Automatically available

**You cannot and should not try to set variables with the SUPABASE_ prefix.**

#### Custom Secrets (SET THESE)

Set these 3 secrets in Supabase Dashboard → Edge Functions → Secrets:

1. **DASHBOARD_PASSWORD**
   - Choose a strong password for dashboard login
   - Example: `MySecurePassword123!`

2. **N8N_REFRESH_WEBHOOK_URL**
   - Your n8n webhook URL
   - Example: `https://your-n8n-instance.com/webhook/refresh-dashboard`

3. **N8N_REFRESH_SECRET**
   - A secret key to authenticate requests to n8n
   - Example: `super-secret-key-12345`

### Setting Secrets via Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref gwfkrtaqrgfosaqfcitq

# Set the 3 custom secrets (replace with your actual values)
supabase secrets set DASHBOARD_PASSWORD=your_secure_password
supabase secrets set N8N_REFRESH_WEBHOOK_URL=your_n8n_webhook_url
supabase secrets set N8N_REFRESH_SECRET=your_n8n_secret
```

Or set them via the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/gwfkrtaqrgfosaqfcitq/settings/functions
2. Click "Edge Functions" → "Secrets"
3. Add the 3 secrets listed above

## Deploying Edge Functions

### 1. Deploy all functions

```bash
# Deploy all Edge Functions
supabase functions deploy auth
supabase functions deploy dashboard
supabase functions deploy leads
supabase functions deploy refresh
```

### 2. Verify deployment

Check that all functions are deployed:
- https://gwfkrtaqrgfosaqfcitq.supabase.co/functions/v1/auth
- https://gwfkrtaqrgfosaqfcitq.supabase.co/functions/v1/dashboard
- https://gwfkrtaqrgfosaqfcitq.supabase.co/functions/v1/leads
- https://gwfkrtaqrgfosaqfcitq.supabase.co/functions/v1/refresh

## n8n Webhook Configuration

Your n8n workflow should:

1. **Accept POST requests** to the webhook URL
2. **Verify the x-api-key header** matches N8N_REFRESH_SECRET
3. **Return JSON payload** in this format:

```json
{
  "updated_at": "2025-12-03T08:42:39.898Z",
  "summary": {
    "total_leads": 6,
    "by_status": {
      "follow up 1": 2,
      "follow up 2": 3
    },
    "by_master_status": {
      "Warm Lead": 6
    },
    "followups_due_now": 0,
    "followups_due_today": 0,
    "new_leads_last_24h": 6
  },
  "leads": [
    {
      "id": 33,
      "meta_lead_id": "1378450923853233",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Example Inc",
      "phone": "+1234567890",
      "country": "USA",
      "status": "follow up 1",
      "master_status": "Warm Lead",
      "average_score": 6.3,
      "persona_fit": 6.5,
      "activation_fit": 10,
      "intent_score": 2.5,
      "ad_id": 120211571189270500,
      "ad_name": "Campaign Name",
      "where": "shopping_malls",
      "what_matters": "cheapest_available_option",
      "experience_with_technology": "Not yet, but interested",
      "last_contact_timestamp": "2025-12-03T04:11:37.317+00:00",
      "next_followup_timestamp": "2025-12-05T04:58:00+00:00"
    }
  ]
}
```

## Running Locally

### Development Server

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing Edge Functions Locally

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve --env-file .env.local

# In another terminal, test the auth function
curl -X POST http://localhost:54321/functions/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"password": "your_password"}'
```

## Building for Production

```bash
# Build the frontend
npm run build

# Preview the production build
npm run preview
```

## Deployment

### Option 1: Deploy to Lovable

1. Push your changes to GitHub
2. Go to [Lovable](https://lovable.dev/projects/7cded692-b915-44f9-ba54-4de3fe286d45)
3. Click Share → Publish

### Option 2: Deploy to Vercel/Netlify

```bash
# Build
npm run build

# Deploy the `dist` folder to your hosting provider
```

## Security Checklist

- [ ] Service role key is set in Supabase secrets (not in .env)
- [ ] Dashboard password is strong and secure
- [ ] n8n webhook is protected with the secret key
- [ ] .env file does NOT contain sensitive backend secrets
- [ ] .gitignore includes .env files

## API Endpoints

After deployment, your Edge Functions will be available at:

- **POST** `/auth` - Login with password
- **GET** `/dashboard` - Fetch dashboard data (requires auth)
- **GET** `/leads?id=<lead_id>` - Fetch single lead details (requires auth)
- **POST** `/refresh` - Trigger n8n refresh (requires auth)

## Troubleshooting

### "Failed to fetch dashboard data"
- Check that the `dashboard_cache` table exists and has a row with id=1
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly in Edge Function secrets

### "Invalid password"
- Verify DASHBOARD_PASSWORD is set in Edge Function secrets
- Check that you're using the correct password

### "Failed to refresh data"
- Verify N8N_REFRESH_WEBHOOK_URL is correct
- Check that N8N_REFRESH_SECRET matches in both systems
- Test the n8n webhook manually to ensure it returns the correct payload

### Edge Functions not deploying
- Make sure you're logged in: `supabase login`
- Verify project is linked: `supabase link --project-ref gwfkrtaqrgfosaqfcitq`
- Check Supabase CLI version: `supabase --version`

## Support

For issues or questions:
1. Check the console for error messages
2. Review Supabase Edge Function logs in the dashboard
3. Verify all environment variables are set correctly
