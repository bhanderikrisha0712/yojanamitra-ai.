# YojanaMitra AI — Government Scheme Assistant

A polished responsive web prototype with separate frontend assets, Vercel serverless backend endpoints, Supabase/PostgreSQL database support, and a live public Indian PIN-code lookup.

## What is included
- Responsive landing page, scheme catalogue, category filters and search.
- Profile-based scheme matching (transparent rules-based ranking; not an official eligibility decision).
- Backend API endpoints: `GET /api/schemes`, `POST /api/match`, `GET /api/pincode?pin=380001`.
- Demo catalogue that works before you connect a database.
- Supabase SQL schema + starter catalogue in `supabase/schema.sql`.
- External links to official scheme websites; scheme details should be checked before real use.

## Technology
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js Vercel Functions
- Database: Supabase PostgreSQL (optional until configured)
- Live API: public India Post PIN-code lookup through a backend proxy
- Hosting: Vercel

## Run locally
1. Install Node.js LTS.
2. Open this folder in VS Code.
3. In the terminal run `npx vercel dev`.
4. Follow the prompts. Open the local URL printed by Vercel.
   - Avoid opening `index.html` directly with `file://`; API calls need a server.
5. Without Supabase environment variables, the site uses the included demo catalogue.

## Connect Supabase database
1. Create a project in Supabase.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Supabase Project Settings, copy the Project URL and the server-side service-role/secret key.
4. In Vercel: Project → Settings → Environment Variables, add:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = your service-role/secret key
5. Add them to Production, Preview and Development only if needed, save, then redeploy.
6. Check `/api/schemes` on your deployed domain. It should return `"source":"database"`.

**Security:** the service-role key bypasses Row Level Security. It must only be stored in Vercel server-side environment variables. Never put it in `app.js`, `index.html`, screenshots, or GitHub. The demo has no citizen login and does not store profile answers.

## Publish to Vercel using GitHub
1. Create a GitHub repository, for example `yojanamitra-ai`.
2. Upload the contents of this ZIP to the repository root (do not upload the ZIP itself as the only file).
3. Sign in to Vercel and choose **Add New → Project**.
4. Import the `yojanamitra-ai` GitHub repository.
5. Framework preset: **Other**. Build command: leave blank. Output directory: leave blank/default. Root directory: `./`.
6. Click **Deploy**. Vercel deploys `index.html` and the `/api` functions.
7. Add Supabase environment variables as described above and redeploy.

Official deployment documentation: https://vercel.com/docs/deployments/overview

## API notes
- `GET /api/schemes`: reads Supabase when configured; otherwise returns demo records.
- `POST /api/match`: validates broad profile selections and returns a ranked shortlist.
- `GET /api/pincode?pin=380001`: queries the public PIN-code API server-side.
- The PIN API is an external public service and may have rate limits or downtime.
- There is no verified public myScheme API configured in this starter. Do not describe this as a direct live integration with the myScheme platform. Scheme records are catalogue pointers; keep them current and verify their official destination pages.

## Before presenting or launching publicly
- Verify every scheme name, current benefit, eligibility condition, application deadline and official URL.
- Add `last_verified` dates and a content-review process.
- Test mobile layout, error states and all official links.
- Add an appropriate privacy notice and accessibility review.
- Do not collect Aadhaar, bank details, OTPs or other sensitive information.
- Clearly state this is an independent prototype, not an official government service.
