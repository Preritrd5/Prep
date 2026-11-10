# PrepTrack — Production Deployment & Configuration Guide

This guide details the deployment architecture, hosting configuration, environment secrets management, and pre-flight verification required to host PrepTrack in a production cloud environment (e.g., Vercel + Supabase).

---

## 1. Hosting Architecture
- **Web Application & API Handlers:** Next.js 15 App Router hosted on **Vercel** (Edge & Node.js Serverless runtime).
- **Primary Database & Auth:** **Supabase Managed PostgreSQL** with PostgREST and Supabase Auth.
- **AI Intelligence:** **Google Gemini 2.5 Flash API** invoked strictly server-side via `@google/genai`.

---

## 2. Production Environment Secrets Checklist

Configure the following environment variables in the Vercel Project Settings (`Settings` &rarr; `Environment Variables`). **Never commit these values to source control or embed them in frontend bundles.**

| Variable Name | Exposure | Purpose / Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public (Client + Server) | Canonical production domain (e.g. `https://preptrack.example.com`). |
| `APP_BASE_URL` | Server Only | Internal server-side routing base URL. |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client + Server) | Supabase project API gateway endpoint. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client + Server) | Public anon key for cookie-based authentication via `@supabase/ssr`. |
| `SUPABASE_URL` | Server Only | High-performance server-side Supabase URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Strictly Server Only** | Administrative service role bypass key used solely for background evaluation and admin operations. |
| `SUPABASE_PROJECT_ID` | Server Only | Unique Supabase project identifier. |
| `GEMINI_API_KEY` | **Strictly Server Only** | Google Gemini API key used by the AI Question Generator and Study Assistant. |
| `CRON_SECRET` | **Strictly Server Only** | Shared secret bearer token for invoking `/api/cron/reminders` from scheduled jobs. |

---

## 3. Supabase Auth Configuration
In the **Supabase Dashboard** (`Authentication` &rarr; `URL Configuration`):
1. **Site URL:** Set to `https://preptrack.example.com` (or production domain).
2. **Redirect URLs:** Whitelist:
   - `https://preptrack.example.com/auth/callback`
   - `https://preptrack.example.com/login`
   - `https://preptrack.example.com/student/dashboard`
   - `https://preptrack.example.com/admin/dashboard`
3. **Session Cookie Settings:**
   Ensure Secure, HttpOnly, and SameSite=Lax flags are active for `@supabase/ssr` cookies.

---

## 4. Reminder Automation Scheduling (Supabase Cron / Vercel Cron)
To trigger the idempotent daily reminder batch process (Phase 5 Module 9):
In `vercel.json` (or via external cron trigger such as Cloudflare Worker or Supabase `pg_cron`):
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 2 * * *"
    }
  ]
}
```
Ensure HTTP requests include the authorization header:
```
Authorization: Bearer <CRON_SECRET>
```

---

## 5. Pre-Flight Verification & Smoke Tests
Before opening registration to students:
1. **Build Sanity:** Execute `npm run build` to confirm all 45+ dynamic and static routes compile cleanly.
2. **Database Migrations:** Ensure migrations `20261109000000` through `20261110000003` are applied to production PostgreSQL.
3. **Admin Bootstrap:** Verify the designated institutional administrator has `role = 'admin'` in `public.profiles`.
4. **Answer Key Protection:** Run automated security checks verifying that `exam_attempt_answer_keys` and `question_answer_keys` are never queryable by non-admin authenticated users.
5. **Timer Synchronization:** Verify server-authoritative submission logic rejects attempts submitted after `expires_at`.
