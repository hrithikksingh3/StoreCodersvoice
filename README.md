# CodersVoice Store 2.0

React/Vite public storefront and Express/MongoDB API for database-managed products, blogs, orders, and administration.

## Local setup

1. Copy `server/.env.example` to `server/.env` and fill in non-placeholder values. Copy `client/.env.example` if the API is not running at localhost:5000.
2. Run `npm install` in both `client` and `server`.
3. Before the first 2.0 deployment, run `npm run migrate:products` in `server`. It is idempotent and imports the legacy catalogue without touching orders.
4. Start the API with `npm run dev` in `server` and the UI with `npm run dev` in `client`.

## Operations

- Bootstrap exactly one administrator at `POST /api/admin/bootstrap` using the configured bootstrap credentials, then sign in at `/admin`. Remove or rotate `ADMIN_BOOTSTRAP_PASSWORD` once the first account exists.
- Products and posts are created as drafts. Publishing requires the relevant public fields; hidden products and every draft are excluded from public APIs, sitemap, and purchasing.
- Razorpay checkout accepts only a product identifier. The server reads the published product and amount from MongoDB, then verifies signatures and prevents duplicate payment processing.

## Security notes

Admin authentication uses HTTP-only, SameSite cookies plus a CSRF token. Keep `JWT_SECRET`, Razorpay, mail, MongoDB, and Gemini credentials server-only. The old client Gemini Vite injection was removed. If any credentials were ever committed, rotate them.

## Deployment

Set explicit `FRONTEND_URL`, `PUBLIC_API_URL`, and `PUBLIC_SITE_URL` in production. The client includes SPA fallback rules for Vercel and Netlify. Serve `robots.txt` and `sitemap.xml` from the API/reverse-proxy at the public domain so their URLs resolve to the API implementation.
