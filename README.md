# 🔍 Sarath Search Engine v4.1

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-purple.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green.svg)](https://supabase.com/)
[![OpenRouter AI](https://img.shields.io/badge/OpenRouter-Llama%203.3%2070B-cyan.svg)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deploy%20Ready-black.svg)](https://vercel.com/)

**Sarath Search Engine v4.1** is a high-performance, minimal, private Web AI search engine designed with the premium aesthetics of Apple, Arc Browser, Perplexity AI, and Google.

---

## ✨ Features

- 🎯 **Centered Minimal Landing Page**: Hero logo, version badge `2.0`, search input, voice/image search buttons, and popular topic pills.
- 🤖 **Web AI Answer Engine**: Powered by OpenRouter AI (`meta-llama/llama-3.3-70b-instruct:free`) delivering summaries, key takeaways, and inline citation sources `[1]`, `[2]`.
- 📊 **Sarath Search Console**: Complete telemetry, sitemap submission, URL inspection, and robots.txt tester.
- 🔐 **Supabase Integration**: 13 database tables, Row Level Security (RLS) policies, and JWT authentication.
- ⚡ **Optimized Performance**: 100% static & dynamic page compilation with Next.js 15, dynamic XML sitemap, and PWA manifest.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sarath-search.git
cd sarath-search/frontend

# Install dependencies
npm install
```

### 3. Environment Variables Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure the following variables are set:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tjyvgkpcjlswjkkfffnt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1...
OPENROUTER_API_KEY=sk-or-v1-7b4535e15619...
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🗄️ Supabase Setup & Seed

1. Open your Supabase SQL Editor.
2. Run the migration script located at [`supabase/schema.sql`](supabase/schema.sql).
3. Run the seed script at [`supabase/seed.sql`](supabase/seed.sql) to seed default role permissions and admin accounts.

---

## 🚀 Vercel Production Deployment

### Option A: One-Click Deploy via Vercel Dashboard
1. Push this repository to GitHub.
2. Connect your GitHub repository in **[Vercel](https://vercel.com/new)**.
3. Select `frontend` as the **Root Directory**.
4. Add Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`).
5. Click **Deploy**.

### Option B: Deploy via Vercel CLI
```bash
cd frontend
npx vercel --prod
```

---

## 🧪 Testing & Verification

```bash
# Type Check
npx tsc --noEmit

# Production Build
npm run build
```

---

## 📄 License
Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.
