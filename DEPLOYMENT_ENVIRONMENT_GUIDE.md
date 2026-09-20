# CodersVoice Store deployment guide

This is the production checklist for the current storefront and API. Values below are examples only; configure real values in your hosting dashboard and never commit secrets.

## Deployment layout

| Component | Folder | Build/start command |
| --- | --- | --- |
| Storefront | `client` | `npm run build` (publish `dist`) |
| API | `server` | `npm start` |

Use Node.js **22.12 or newer** on the API host. Both the storefront and API must use public HTTPS URLs in production.

## Frontend environment variables

Set these on the frontend host before the build. Only names beginning with `VITE_` are visible to browser code.

| Variable | Required | Production value |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `https://api.your-domain.example` — API origin only, no trailing slash |

Never place MongoDB, Razorpay secret, Resend, Cloudinary secret, JWT, Gemini, or download-token values in a `VITE_` variable.

## Backend environment variables

Set the following on the API host. `server/.env.example` is a local template, not a production file to upload.

| Variable | Required | Notes |
| --- | --- | --- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Host-dependent | Usually supplied by the host; `5000` locally |
| `MONGO_URI` | Yes | Production MongoDB connection string |
| `FRONTEND_URL` | Yes | Storefront origin, such as `https://store.codersvoice.me`; optional additional origins are comma-separated and must be HTTPS |
| `PUBLIC_API_URL` | Yes | Public HTTPS API origin used in download links |
| `PUBLIC_SITE_URL` | Yes | Public storefront/site URL used by metadata and sitemap |
| `JWT_SECRET` | Yes | Unique random value, at least 32 characters |
| `DOWNLOAD_TOKEN_SECRET` | Yes | Different random value, at least 32 characters; changing it invalidates existing download links |
| `ADMIN_BOOTSTRAP_EMAIL` | First setup | Initial administrator email |
| `ADMIN_BOOTSTRAP_PASSWORD` | First setup | Long unique password; remove or rotate after first account setup |
| `RAZORPAY_KEY` | Yes | Production/live Razorpay key when accepting real payments |
| `RAZORPAY_SECRET` | Yes | Matching Razorpay secret; server-only |
| `RESEND_API_KEY` | Yes | Active Resend API key |
| `EMAIL_USER` | Yes | Sender on a Resend-verified domain |
| `GEMINI_API_KEY` | If AI chat is enabled | Server-only Gemini key |
| `CLOUDINARY_CLOUD_NAME` | Yes for media uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes for media uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes for media uploads | Cloudinary secret; server-only |

Generate a secret with a password manager or a cryptographically secure generator. For example in PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Generate separate values for `JWT_SECRET` and `DOWNLOAD_TOKEN_SECRET`.

## First deployment checklist

1. Install API dependencies with `npm install` in `server`; install frontend dependencies with `npm install` in `client`.
2. Configure every backend variable above on the API host. In production, the API intentionally refuses to start if required operational variables, URLs, or secret lengths are missing.
3. Set `VITE_API_BASE_URL` on the frontend host, then run `npm run build` from `client` and publish `client/dist`.
4. Configure the API host to run `npm start` from `server`.
5. Configure SPA rewrites so `/admin`, product pages, and article pages return the frontend `index.html`. This repository includes `client/vercel.json` and `client/public/_redirects`.
6. For the first Store 2.0 rollout, run `npm run migrate:products` once from `server` after the API can reach MongoDB. It is idempotent and does not modify orders.
7. Visit the store, `/admin`, a product page, and a blog page directly in a private browser window.
8. Complete a small Razorpay live test; confirm the order appears in Admin → Orders, then check the Resend delivery record and download link.
9. Create a test product with a thumbnail and up to five gallery images; verify Cloudinary stores them under `codersvoice/products`.
10. Remove or rotate `ADMIN_BOOTSTRAP_PASSWORD` after the initial account exists.

## Routine updates

After code changes, rebuild and redeploy `client`, then restart/redeploy `server`. A Vite environment-variable change always requires a fresh frontend build. A server environment-variable change requires an API restart.
