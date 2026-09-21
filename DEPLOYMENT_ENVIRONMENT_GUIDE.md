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
| `DATABASE_STORAGE_LIMIT_MB` | Optional | Storage-meter quota in MB; defaults to `512`, but set it to the actual MongoDB Atlas plan limit |
| `ATLAS_PROJECT_ID` | Optional | Atlas project ID for the automatic capacity meter. |
| `ATLAS_SERVICE_ACCOUNT_CLIENT_ID` | Optional | Client ID of a dedicated Atlas service account with `Project Read Only`. |
| `ATLAS_SERVICE_ACCOUNT_SECRET` | Optional | Secret for that service account. Server-only secret; never expose it to the frontend or commit it. |
| `ATLAS_PROCESS_ID` | Optional | Required only if the Atlas project has more than one primary process; select the store cluster's primary process ID. |
| `FRONTEND_URL` | Yes | Storefront origin, such as `https://store.codersvoice.me`; optional additional origins are comma-separated and must be HTTPS |
| `PUBLIC_API_URL` | Yes | Public HTTPS API origin used in download links |
| `PUBLIC_SITE_URL` | Recommended | Public storefront URL used by metadata and sitemap. If omitted, the API safely uses the first `FRONTEND_URL` value, preventing a metadata-only configuration omission from blocking Render startup. |
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
11. In Admin → Products, set **Your revenue share %** for every partner-owned product before its first sale. For example, `30` retains 30% for CodersVoice and allocates 70% to the partner. New orders snapshot this value; historical orders without one use the product's current value or the Revenue Analytics fallback.
12. Generate a Revenue Analytics PDF/Excel report for a short test period. The report intentionally includes only verified paid orders. PDF reports include a trend chart; Excel reports include a filtered report and a Revenue trend sheet.

No database migration is required for the retention or revenue features. MongoDB creates the new optional product/order fields as records are updated or created; historical revenue records use the documented fallback calculation.

## Routine updates

After code changes, rebuild and redeploy `client`, then restart/redeploy `server`. A Vite environment-variable change always requires a fresh frontend build. A server environment-variable change requires an API restart.

## Admin data retention and reports

- Reports are limited to 5,000 matching records per download. Use the date and product filters for larger histories; the response marks capped reports.
- Revenue Analytics accepts all products or selected products, custom dates, and 7/30/60/90-day presets. Revenue uses verified payment capture time when available and order creation time only for historical orders that do not have a capture timestamp.
- Data management can delete only audit logs and orders. It cannot delete products, blog posts, settings, or payment configuration.
- The Data management capacity meter uses the Atlas Administration API automatically when `ATLAS_PROJECT_ID`, `ATLAS_SERVICE_ACCOUNT_CLIENT_ID`, and `ATLAS_SERVICE_ACCOUNT_SECRET` are configured. The service account must have `Project Read Only` and Atlas must permit API traffic from the API host's public IP. The metric is cached for five minutes and Atlas itself updates measurements periodically. If Atlas is unavailable, the screen transparently falls back to the local collection/index footprint; Atlas remains the billing authority.
- Cleanup batches must be exported before deletion. **NDJSON** is analysis-friendly for MongoDB tools, scripts, and ChatGPT-assisted analysis; **Excel** is review-friendly. Both contain customer/transaction data and intentionally exclude payment signatures and private download URLs.
- The in-app export is a protected, portable record export for cleanup recovery and analysis—not a full point-in-time `mongodump` archive. For complete disaster recovery, maintain an independent MongoDB Atlas backup/export with credentials that are not stored in this application.
- The deletion floor is server-enforced: the latest 7 days of audit logs and the latest 30 days of orders remain protected, even if an administrator modifies browser requests. A cleanup requires a preview, an exact typed confirmation, a final browser confirmation, and uses batches of at most 10,000 records.
