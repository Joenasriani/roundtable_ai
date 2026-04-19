# Roundtable AI

Roundtable AI is a Vite + React application that runs a multi-expert reasoning workflow and renders structured analysis results.

## Stack

- Frontend: React 19 + TypeScript + Vite
- Local API server: Express (`server.ts`)
- Deployment target: Vercel (static frontend + `/api/analyze` serverless function)

## Local development

**Prerequisite:** Node.js 20+

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill values you need.
3. Start the app (frontend + local API on `http://localhost:3000`)
   ```bash
   npm run dev
   ```

## Environment variables

See `.env.example`.

- `GEMINI_API_KEY` (optional): client-side Gemini fallback key.
- `VITE_PAYPAL_CLIENT_ID` (optional): PayPal client ID. Defaults to sandbox (`sb`) if not set.
- `APEX_INNOVATE_API` or `OPENROUTER_API_KEY` (optional): enables server-side `/api/analyze` proxy.
- `OPENROUTER_MODEL` (optional): override the default OpenRouter model used by `/api/analyze`.
- `APP_URL` (optional): used in OpenRouter referer header.

## Build & checks

```bash
npm run lint
npm run build
```

## Deploy to Vercel

1. Import the repository in Vercel.
2. Set the environment variables from `.env.example`.
3. Deploy (Vercel uses `vercel.json` with Vite output `dist` and the `/api/analyze` function).
