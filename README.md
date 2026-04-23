# LoveSpark Repo Layout

This repository now contains two independently deployable Vite projects:

- `web/` - public marketing website (no authenticated product runtime)
- `app/` - authenticated LoveSpark product application (Supabase/auth preserved)

## Local Development

### Marketing Website (`web`)

```bash
cd web
npm install
npm run dev
```

Optional environment variable for CTA redirects:

- `VITE_APP_URL` - full URL of the deployed app (for example: `https://app.yourdomain.com`)

If `VITE_APP_URL` is not set, CTAs default to `http://localhost:5173`.

### Product App (`app`)

```bash
cd app
npm install
npm run dev
```

Required environment variables for app authentication/data:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Build

```bash
cd web
npm run build

cd ../app
npm run build
```

## Vercel Deployment (Same GitHub Repo, Two Projects)

Create two Vercel projects from this same repository:

1. Project A (Marketing Website)
- Root Directory: `web`
- Build Command: `npm run build`
- Output Directory: `dist`

2. Project B (Product App)
- Root Directory: `app`
- Build Command: `npm run build`
- Output Directory: `dist`

Set environment variables separately per Vercel project:

- `web` project: `VITE_APP_URL` (recommended)
- `app` project: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Notes

- `app` retains Supabase/auth logic and authenticated product modules.
- `web` is public-facing and does not run product auth flows directly.
- Keep secrets in environment variables only; do not hardcode in source.
