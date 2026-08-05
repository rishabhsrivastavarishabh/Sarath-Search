# 📜 Changelog

All notable changes to Sarath Search Engine will be documented in this file.

## [v4.1.0] - 2026-08-05

### Added
- **Production CI/CD Pipelines**: Added GitHub Actions workflows (`.github/workflows/ci.yml` and `deploy-preview.yml`).
- **OpenRouter AI Overview Engine**: Integrated OpenRouter API (`meta-llama/llama-3.3-70b-instruct:free`) for real-time Web AI summaries and citations.
- **Dynamic SEO & PWA**: Added `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD Schema.org structured data, and OpenGraph Twitter metadata.
- **Canvas Image Compression**: Added automatic client-side canvas avatar image compression (`< 30 KB`) preventing Vercel body size limits (`1048576 bytes`).
- **Supabase Search History**: Integrated live search history tracking and clear history actions.
- **Vercel Security Configuration**: Added security headers (HSTS, CSP, XSS protection, Frame options) and caching rules in `vercel.json`.

## [v3.1.0] - 2026-08-04

### Added
- **Redesigned Home Landing Page**: Minimal centered layout inspired by Apple, Arc Browser, Perplexity AI, and Google.
- **Sarath Search Console**: Added 15 sub-modules (URL Inspection, Robots Tester, Sitemaps, Core Web Vitals, Crawl Logs).
- **Supabase Database Schema**: Created `supabase/schema.sql` with 13 production tables and RLS security policies.
