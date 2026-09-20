# CodersVoice Store security audit report

Audit date: 2026-09-20  
Scope: local repository only. No production systems were accessed, changed, or scanned.

## Executive summary

The application has a sensible baseline for an internet-facing store: HTTPS-only production configuration, authenticated admin endpoints, HttpOnly SameSite session cookies, CSRF checks on admin mutations, server-side payment price lookup, Razorpay signature verification, rate limits, and HTML sanitisation for blog content.

This audit added validation around image uploads and remote image imports, tighter upload parser limits, content-security headers on the API, production startup validation, report/download rate limits, bounded report queries, dependency updates, and regression tests. The known residual dependency finding is documented below.

## Architecture and attack surface

| Area | Exposure | Controls |
| --- | --- | --- |
| Store and blog APIs | Public read access | Pagination, input length checks, public data projections |
| Checkout and payment verification | Public POST endpoints | Rate limit, published-product lookup, server-side price, Razorpay HMAC verification, duplicate-payment protection |
| Digital download redirect | Public signed-link endpoint | Paid-order check, HMAC token validation, rate limit |
| Contact and AI chat | Public POST endpoints | Dedicated rate limits and request validation |
| Admin portal/API | Authenticated | JWT HttpOnly cookie, session version, SameSite cookies, CSRF token on mutations, audit logs |
| Admin image upload | Authenticated | CSRF, size/part limits, MIME allowlist, file-signature validation, Cloudinary-only storage |
| Reports | Authenticated | Rate limit, filtered queries, 5,000 record cap |

## Changes made in this audit

1. Added `server/src/utils/image-security.js`.
   - Verifies JPEG, PNG, WebP, GIF, and AVIF file signatures before an upload reaches Cloudinary.
   - Rejects `localhost`, private/reserved IP ranges, credentials, non-HTTPS URLs, and custom ports for image URL imports.
   - Resolves remote hostnames and rejects private-network DNS results before Cloudinary is asked to import the image.
2. Hardened the Multer upload limits in `server/src/routes/admin.routes.js` to limit field count, field size, field-name size, and multipart parts.
3. Enabled a restrictive API Content Security Policy and disabled Express’ identifying `X-Powered-By` header in `server/src/app.js`.
4. Added dedicated rate limits to download and report endpoints; reports now cap at 5,000 records and signal the cap through `X-Report-Record-Limit`.
5. Added production environment validation in `server/src/config/environment.js`. Production startup now fails fast when essential credentials, public HTTPS URLs, or 32-character secrets are absent.
6. Removed two unused Google SDKs. The AI route uses its existing Axios integration, so removing the unused SDKs also removed the prior critical protobuf dependency chain.
7. Applied non-breaking npm dependency fixes, updated the supported Node requirement to `>=22.12.0`, and added a compatible `htmlparser2` resolution needed by `sanitize-html` in the CommonJS backend.
8. Added `server/test/image-security.test.js` and `npm test` for upload-signature and network-address regression coverage.

## Verification performed

| Check | Result |
| --- | --- |
| Backend security regression tests | Passed: 3 tests |
| Backend module-load check | Passed |
| Frontend production build | Passed before this audit; rerun before deployment after any frontend change |
| Backend dependency audit after fixes | 2 moderate findings remain, both from ExcelJS’ transitive `uuid` dependency |
| Current tracked secret-file check | Only `.env.example` files are currently tracked |

## Dependency audit remaining finding

`npm audit --omit=dev` reports two moderate `uuid` advisories through `exceljs`. npm’s only automatic option is `npm audit fix --force`, which proposes a breaking ExcelJS downgrade and could break the downloadable reports feature. It was deliberately **not** applied.

Risk is limited to the server-side report-generation dependency and no user input is passed to UUID buffer APIs by this application. Monitor ExcelJS for a compatible release that upgrades its UUID dependency, then update and rerun the audit. Do not force-downgrade ExcelJS in production without report regression testing.

## Remaining operational checks before deployment

- Use Node.js 22.12 or newer on the API host.
- Configure the variables in [DEPLOYMENT_ENVIRONMENT_GUIDE.md](DEPLOYMENT_ENVIRONMENT_GUIDE.md); especially `FRONTEND_URL`, `PUBLIC_API_URL`, `JWT_SECRET`, `DOWNLOAD_TOKEN_SECRET`, Razorpay, Resend, and Cloudinary.
- Test real email delivery from the production sender/domain and inspect the Resend event log.
- Test a live Razorpay payment and download on the production domain.
- Keep `ADMIN_BOOTSTRAP_PASSWORD` only until the first administrator is created, then remove or rotate it.
- Rotate any secret previously pasted into code, screenshots, chat, logs, or source control.

## Historical secret handling

The current Git index tracks only `client/.env.example` and `server/.env.example`. However, Git history contains references to `client/.env` and `server/.env`. Their historical contents were not printed or exposed during this audit. Treat every credential that may have existed in either historical file as compromised: rotate MongoDB, JWT/download-token, Razorpay, Resend, Gemini, and Cloudinary values before deployment. A new `.gitignore` prevents accidental recommit of local `.env` files.

Removing secrets from already-pushed Git history is a destructive, coordinated operation. It was not performed in this local audit; do it only after confirming every affected secret has been rotated and all collaborators are prepared for the repository-history rewrite.

## Out of scope / limitations

- This review did not scan the deployed hosts, DNS configuration, MongoDB Atlas network rules, Cloudinary account policy, Razorpay dashboard, Resend domain verification, or external provider configuration.
- Cloudinary performs the eventual remote image fetch. The application blocks unsafe URL forms and local/private DNS answers before import, but operational DNS rebinding controls remain the responsibility of the hosting and Cloudinary platforms.
- Download links are signed and paid-order gated, but remain valid until `DOWNLOAD_TOKEN_SECRET` is rotated. If time-limited customer links are required, implement expiring per-order tokens as a separate product decision with migration and support planning.
