# CodersVoice Store 2.0

React/Vite storefront and Express/MongoDB API with Razorpay checkout, Cloudinary product media, Resend delivery emails, and an authenticated admin portal.

## Deployment guide

Use [DEPLOYMENT_ENVIRONMENT_GUIDE.md](DEPLOYMENT_ENVIRONMENT_GUIDE.md) as the authoritative production checklist and environment-variable matrix. Use [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) for the current hardening scope, verification results, and remaining operational checks.

For a complete Oracle Cloud Always Free VPS deployment—from account creation and SSH keys through Nginx, systemd, HTTPS, DNS, and live verification—follow [DEPLOY_ORACLE_FREE_TIER_VPS.md](DEPLOY_ORACLE_FREE_TIER_VPS.md).

## Local setup

1. Copy `server/.env.example` to `server/.env` and fill in non-placeholder values. Copy `client/.env.example` if the API is not running at localhost:5000. Keep every secret server-only.
2. Run `npm install` in both `client` and `server`.
3. Before the first 2.0 deployment, run `npm run migrate:products` in `server`. It is idempotent and imports the legacy catalogue without touching orders.
4. Start the API with `npm run dev` in `server` and the UI with `npm run dev` in `client`.

## Operations

- Bootstrap exactly one administrator at `POST /api/admin/bootstrap` using the configured bootstrap credentials, then sign in at `/admin`. Remove or rotate `ADMIN_BOOTSTRAP_PASSWORD` once the first account exists.
- Products and posts are created as drafts. Publishing requires the relevant public fields; hidden products and every draft are excluded from public APIs, sitemap, and purchasing.
- Razorpay checkout accepts only a product identifier. The server reads the published product and amount from MongoDB, then verifies signatures and prevents duplicate payment processing.
- Revenue Analytics calculates only verified paid orders. Set each product's **Your revenue share %** in Admin → Products; new checkout orders snapshot that percentage so historical partner calculations stay stable. Existing orders without a snapshot use the current product share or the report fallback.
- Admin → Data management can purge only old audit logs and orders. The server always retains the newest 7 days of audit logs and 30 days of orders, requires an exact confirmation, and limits each deletion batch to 10,000 records.

## Security notes

Admin authentication uses HTTP-only, SameSite cookies plus a CSRF token. Keep `JWT_SECRET`, Razorpay, mail, MongoDB, and Gemini credentials server-only. The old client Gemini Vite injection was removed. If any credentials were ever committed, rotate them.

## Deployment

Set explicit `FRONTEND_URL`, `PUBLIC_API_URL`, and `PUBLIC_SITE_URL` in production. The client includes SPA fallback rules for Vercel and Netlify. Serve `robots.txt` and `sitemap.xml` from the API/reverse-proxy at the public domain so their URLs resolve to the API implementation. Use Node.js 22.12 or newer for the API.
