
# Roundtable AI

Roundtable AI is a React + Vite app with an API endpoint that can use OpenRouter (recommended for production) and a client-side Gemini fallback.

## Local development

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Optional: set environment variables in `.env.local`:
   ```bash
   # Optional for browser fallback (BYO key mode)
   VITE_GEMINI_API_KEY=...

   # Optional for server-side analysis via OpenRouter
   ROUNDTABLE_API=...
   APP_URL=http://localhost:3000

   # Optional for PayPal production client ID
   VITE_PAYPAL_CLIENT_ID=...
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Vercel deployment

This repository is Vercel-ready:
- `/api/analyze.ts` is deployed as a Serverless Function.
- `vercel.json` routes all `/api/*` requests to functions and rewrites other routes to the SPA entry.

Set these variables in Vercel Project Settings:
- `ROUNDTABLE_API` (your OpenRouter API key, as you requested)
- `APP_URL` (your deployed app URL, e.g. `https://your-app.vercel.app`)
- `VITE_PAYPAL_CLIENT_ID` (optional, if using PayPal live mode)
- `VITE_GEMINI_API_KEY` (optional fallback for client-side mode)
