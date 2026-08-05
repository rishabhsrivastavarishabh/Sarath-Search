# 🛡️ Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.1.x   | :white_check_mark: |
| 3.1.x   | :white_check_mark: |
| < 3.0   | :x:                |

## Reporting Vulnerabilities

If you discover a potential security vulnerability within Sarath Search Engine, please report it immediately by emailing **security@sarath-search.org** or submitting a private security advisory on GitHub.

Do NOT open public GitHub issues for security vulnerabilities.

## Security Practices
- **Row Level Security (RLS)**: Enforced across all Supabase database tables.
- **Content Security Policy (CSP)**: Security headers configured in `vercel.json` and Next.js middleware.
- **Service Keys**: `SUPABASE_SERVICE_ROLE_KEY` is strictly used server-side in API routes and never exposed to the client bundle.
