# Deployment Domains Checklist

## Vercel Projects

### Project 1
- name: lovespark-web
- root: web
- domain: https://lovespark.synerva.tech

### Project 2
- name: lovespark-app
- root: app
- domain: https://lovespark-app.synerva.tech

## Cloudflare DNS
- CNAME lovespark -> cname.vercel-dns.com
- CNAME lovespark-app -> cname.vercel-dns.com

## Supabase Auth
- Site URL: https://lovespark-app.synerva.tech
- Redirect URLs:
  - https://lovespark-app.synerva.tech/*
  - https://lovespark.synerva.tech/*
  - http://localhost:5173/*

## Vercel Environment Variables

### Web project
- VITE_PUBLIC_APP_URL
- VITE_PUBLIC_SITE_URL

### App project
- VITE_PUBLIC_APP_URL
- VITE_PUBLIC_SITE_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
