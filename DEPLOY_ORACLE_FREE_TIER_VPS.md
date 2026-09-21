# Deploy CodersVoice Store on an Oracle Cloud Always Free VPS

This guide takes the project from a new Oracle Cloud account to a live HTTPS deployment.

It uses this production layout:

```text
https://store.codersvoice.me       -> Nginx -> Vite static files
https://api.store.codersvoice.me   -> Nginx -> Express API on 127.0.0.1:5000
                                        -> MongoDB Atlas, Razorpay, Resend, Cloudinary
```

**Do not use Kestrel.** Kestrel is an ASP.NET/.NET web server. This repository is a Node.js Express API and Vite/React frontend. The correct stack is **Nginx + systemd + Node.js**.

> Important: the application currently uses **MongoDB/Mongoose**, not PostgreSQL/Neon. Oracle hosts the frontend/API; MongoDB Atlas remains the database host. Do not install PostgreSQL on the VPS for this project unless you intentionally migrate the entire backend.

## Before starting

Have these ready:

- A domain you can manage in DNS: `codersvoice.me`.
- A Git repository URL containing this project.
- Production values from [DEPLOYMENT_ENVIRONMENT_GUIDE.md](DEPLOYMENT_ENVIRONMENT_GUIDE.md).
- A MongoDB Atlas production connection string that permits the Oracle VPS public IP.
- Live Razorpay credentials, a Resend API key with a verified sender, and Cloudinary credentials.
- A computer with Windows PowerShell and OpenSSH (both are available on current Windows installations).

Never paste private keys, API secrets, or `.env` files into GitHub, chat, screenshots, or the frontend host.

## 1. Create and secure the Oracle Cloud account

1. Go to [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/) and create an account.
2. During sign-up, select your **home region carefully**. Always Free compute resources are available in the home region. Oracle documents the current Always Free limits and shapes [here](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm).
3. Enable multi-factor authentication on the Oracle account immediately.
4. In the OCI Console, create a compartment named `codersvoice-production`. Keeping production resources in one compartment makes them easier to find and protect.

Always Free capacity can be temporarily unavailable. If OCI reports an out-of-capacity error for an Always Free shape, try another availability domain or try again later; Oracle documents this behavior in its [Always Free guidance](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm).

## 2. Create an SSH key on Windows

Open **PowerShell** on your own computer, not on the VPS:

```powershell
ssh-keygen -t ed25519 -C "codersvoice-oracle-production"
```

When asked where to save it, accept the default or use a memorable private location. Set a passphrase when prompted.

Print the public key and copy the entire one-line value:

```powershell
Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
```

Keep `id_ed25519` private. Upload/paste only the `.pub` value. OCI cannot recover a generated private key later, and anyone with it can access the server. Oracle’s instance documentation explains the SSH-key requirement for Ubuntu instances [here](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm).

## 3. Create the Always Free Ubuntu instance

1. OCI Console → **Compute** → **Instances** → **Create instance**.
2. Set:
   - Name: `codersvoice-store-prod`
   - Compartment: `codersvoice-production`
   - Image: **Canonical Ubuntu 24.04** (or the current Ubuntu LTS image marked **Always Free Eligible**)
3. Click **Change shape**. Prefer `VM.Standard.A1.Flex` if capacity is available. Allocate a conservative Always Free configuration, for example **1 OCPU and 6 GB RAM**. It is Arm64, which is supported by Node.js and this application.
4. If A1 capacity is unavailable, use an Always Free micro shape as a temporary fallback, understanding that its 1 GB RAM is much tighter for builds.
5. Under Networking, create or select a **public subnet** and ensure **Assign a public IPv4 address** is enabled.
6. Under Add SSH keys, choose **Paste public keys** and paste the `.pub` line generated above.
7. Keep the boot volume within the Always Free allowance. Click **Create**.
8. Wait until its state is **Running**, then copy its public IP address.

OCI’s official instance flow covers the Compute → Instances → Create instance screens and public-IP requirement [here](https://docs.oracle.com/en-us/iaas/Content/Compute/Tasks/launchinginstance.htm).

## 4. Open only the network ports you need

OCI has a cloud firewall in front of Ubuntu. Open these inbound rules in either a **Network Security Group** (preferred) or the subnet Security List:

| Protocol | Destination port | Source | Why |
| --- | ---: | --- | --- |
| TCP | 22 | **Your public IP/32 only** | SSH administration |
| TCP | 80 | `0.0.0.0/0` | HTTP and Let’s Encrypt validation |
| TCP | 443 | `0.0.0.0/0` | Public HTTPS |

Do **not** open port `5000`, MongoDB ports, or database administration ports to the internet. Nginx will be the only public process; Express listens locally.

In OCI: **Networking** → **Virtual cloud networks** → your VCN → **Network Security Groups** (or **Security Lists**) → add the rules. OCI calls these virtual-firewall rules Security Lists/NSGs and recommends NSGs for finer control; see the [Oracle documentation](https://docs.oracle.com/en-us/iaas/Content/Network/Concepts/securitylists.htm).

## 5. Point DNS to the VPS

In the DNS provider that manages `codersvoice.me`, create these A records:

| Host/name | Type | Value |
| --- | --- | --- |
| `store` | A | `<ORACLE_VPS_PUBLIC_IP>` |
| `api.store` | A | `<ORACLE_VPS_PUBLIC_IP>` |

Wait until both resolve from your computer:

```powershell
nslookup store.codersvoice.me
nslookup api.store.codersvoice.me
```

Do this **before** requesting the HTTPS certificate. Do not create an AAAA record unless you have also configured a working public IPv6 address on OCI.

## 6. Connect and apply the first-server security baseline

From PowerShell, replace the placeholders and connect:

```powershell
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" ubuntu@<ORACLE_VPS_PUBLIC_IP>
```

On the VPS, update Ubuntu and configure its own firewall (this is a second layer in addition to OCI):

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ufw fail2ban git curl ca-certificates build-essential nginx
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Optional but recommended: lock SSH to keys only after verifying you can log in with the key.

```bash
sudo nano /etc/ssh/sshd_config
```

Ensure these values are present, then save and restart SSH:

```text
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart ssh
```

Keep the current SSH session open, open a second terminal, and confirm key login still works before closing the first one.

## 7. Install Node.js 22 and create the service user

This project requires Node.js **22.12 or newer**. Install Node 22 from NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

The first command must show `v22.12.0` or newer. Then make an unprivileged account that will own and run the app:

```bash
sudo adduser --system --group --home /srv/codersvoice codersvoice
sudo mkdir -p /srv/codersvoice
sudo chown codersvoice:codersvoice /srv/codersvoice
```

## 8. Clone the project and build it

Replace `<YOUR_GIT_REPOSITORY_URL>` and `<BRANCH>` below. If the repository is private, use a Git deploy key or another safe server-side Git authentication method—not a personal token pasted into shell history.

```bash
sudo -u codersvoice git clone --branch <BRANCH> <YOUR_GIT_REPOSITORY_URL> /srv/codersvoice/store
sudo -u codersvoice npm ci --prefix /srv/codersvoice/store/server
sudo -u codersvoice npm ci --prefix /srv/codersvoice/store/client
```

Create the frontend production environment file. Replace only the hostname if you deliberately choose another API domain:

```bash
sudo -u codersvoice nano /srv/codersvoice/store/client/.env.production
```

Put exactly this public value in it:

```dotenv
VITE_API_BASE_URL=https://api.store.codersvoice.me
```

Build the frontend:

```bash
sudo -u codersvoice npm run build --prefix /srv/codersvoice/store/client
```

The static site is now at `/srv/codersvoice/store/client/dist`.

## 9. Create the server environment file

Create a root-owned file that systemd will read. Do **not** put it inside the Git repository.

```bash
sudo install -d -m 750 /etc/codersvoice
sudo nano /etc/codersvoice/store-api.env
```

Use this template and replace every placeholder with the production value from your provider dashboards:

```dotenv
NODE_ENV=production
PORT=5000
MONGO_URI=<YOUR_MONGODB_ATLAS_PRODUCTION_URI>
FRONTEND_URL=https://store.codersvoice.me
PUBLIC_API_URL=https://api.store.codersvoice.me
PUBLIC_SITE_URL=https://store.codersvoice.me
JWT_SECRET=<UNIQUE_RANDOM_SECRET_AT_LEAST_32_CHARACTERS>
DOWNLOAD_TOKEN_SECRET=<DIFFERENT_UNIQUE_RANDOM_SECRET_AT_LEAST_32_CHARACTERS>
RAZORPAY_KEY=<YOUR_LIVE_RAZORPAY_KEY>
RAZORPAY_SECRET=<YOUR_LIVE_RAZORPAY_SECRET>
RESEND_API_KEY=<YOUR_RESEND_API_KEY>
EMAIL_USER=<VERIFIED_SENDER@YOUR_DOMAIN>
GEMINI_API_KEY=<OPTIONAL_IF_AI_CHAT_IS_ENABLED>
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUD_NAME>
CLOUDINARY_API_KEY=<YOUR_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_API_SECRET>
```

Protect it:

```bash
sudo chown root:codersvoice /etc/codersvoice/store-api.env
sudo chmod 640 /etc/codersvoice/store-api.env
```

Provider checklist before starting the server:

- **MongoDB Atlas:** add the Oracle VPS public IP to Network Access; confirm `MONGO_URI` selects the intended production database.
- **Razorpay:** use matching **live** key/secret, not test credentials.
- **Resend:** verify the sending domain and make `EMAIL_USER` an approved sender.
- **Cloudinary:** retain the standard API credentials; uploaded product assets will be stored in the existing `codersvoice/products` folder.

## 10. Run the API with systemd

Create the service:

```bash
sudo nano /etc/systemd/system/codersvoice-api.service
```

Paste this exact unit:

```ini
[Unit]
Description=CodersVoice Store Express API
After=network.target

[Service]
Type=simple
User=codersvoice
Group=codersvoice
WorkingDirectory=/srv/codersvoice/store/server
EnvironmentFile=/etc/codersvoice/store-api.env
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=/srv/codersvoice/store

[Install]
WantedBy=multi-user.target
```

Enable and inspect it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now codersvoice-api
sudo systemctl status codersvoice-api --no-pager
sudo journalctl -u codersvoice-api -n 100 --no-pager
```

The status must be `active (running)`. If it is not, do not proceed to DNS/HTTPS debugging; read the journal output and correct the missing environment variable or provider credential first.

Confirm Express is local-only:

```bash
curl -i http://127.0.0.1:5000/api/products?limit=1
sudo ss -ltnp | grep 5000
```

## 11. Configure Nginx

Remove the default virtual host and create the CodersVoice configuration:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/codersvoice
```

Paste this configuration. Do not change the `127.0.0.1:5000` address.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name store.codersvoice.me;

    root /srv/codersvoice/store/client/dist;
    index index.html;

    location = /robots.txt {
        proxy_pass http://127.0.0.1:5000/robots.txt;
        proxy_set_header Host $host;
    }

    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:5000/sitemap.xml;
        proxy_set_header Host $host;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name api.store.codersvoice.me;

    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

Enable and test Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/codersvoice /etc/nginx/sites-enabled/codersvoice
sudo nginx -t
sudo systemctl reload nginx
curl -I http://store.codersvoice.me
curl -I http://api.store.codersvoice.me/api/products?limit=1
```

## 12. Add HTTPS certificates

Only do this after the DNS records resolve to the VPS and HTTP works:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d store.codersvoice.me -d api.store.codersvoice.me
```

When asked, choose the redirect option so all HTTP traffic redirects to HTTPS.

Test renewal:

```bash
sudo certbot renew --dry-run
```

Then test the public endpoints:

```bash
curl -I https://store.codersvoice.me
curl -I https://api.store.codersvoice.me/api/products?limit=1
```

## 13. First live verification checklist

Open an incognito/private browser and complete every item:

1. `https://store.codersvoice.me` loads with a valid certificate.
2. Direct-load `/admin`, `/store`, one `/product/<slug>`, and one `/blog/<slug>`; refreshing each must work.
3. Sign into `/admin`; confirm Products, Orders, Payments, Revenue Analytics, Data management, reports, and logout work.
4. Upload one test thumbnail to Cloudinary and verify it appears from a `res.cloudinary.com` URL.
5. Make a low-value live Razorpay purchase. Confirm the order becomes paid, Resend logs show delivery, the email contains a working download link, and the payment appears in Admin.
6. Set a test product’s **Your revenue share %** to `30`, make a paid test order, and confirm Revenue Analytics shows 30% as your revenue and 70% partner payout.
7. Generate a filtered PDF and Excel Revenue report. Verify the PDF chart, social links, totals, and Excel `Revenue trend` sheet.
8. Do **not** test Data management by deleting real data. Review its preview-only behavior first; it permanently protects the newest 7 days of audit logs and 30 days of orders.

## 14. Routine deployment after each Git push

SSH into the server and replace `<BRANCH>` with your production branch:

```bash
sudo -u codersvoice git -C /srv/codersvoice/store fetch origin
sudo -u codersvoice git -C /srv/codersvoice/store checkout <BRANCH>
sudo -u codersvoice git -C /srv/codersvoice/store pull --ff-only origin <BRANCH>
sudo -u codersvoice npm ci --prefix /srv/codersvoice/store/server
sudo -u codersvoice npm ci --prefix /srv/codersvoice/store/client
sudo -u codersvoice npm run build --prefix /srv/codersvoice/store/client
sudo systemctl restart codersvoice-api
sudo nginx -t
sudo systemctl reload nginx
```

Check immediately after every release:

```bash
sudo systemctl status codersvoice-api --no-pager
sudo journalctl -u codersvoice-api -n 100 --no-pager
curl -I https://store.codersvoice.me
curl -I https://api.store.codersvoice.me/api/products?limit=1
```

If the service fails after a deploy, roll back to the prior known-good Git commit, rebuild the client, and restart the service. Do not use `git reset --hard` against an unknown state.

## 15. Useful operations and recovery commands

```bash
# Live API logs
sudo journalctl -u codersvoice-api -f

# Restart only the API
sudo systemctl restart codersvoice-api

# Check Nginx configuration before reloading
sudo nginx -t

# Check disk and memory
df -h
free -h

# Check current service state
sudo systemctl is-active codersvoice-api
```

Always Free instances can be reclaimed when idle under Oracle’s documented criteria. Keep independent backups of your Git repository and provider configuration, monitor the OCI Console, and do not store the only copy of a secret or operational document on the VPS. See Oracle’s [Always Free resource page](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) for the current policy.

## Final production checklist

- [ ] OCI security rules: SSH restricted; only 80/443 public.
- [ ] Ubuntu UFW mirrors the same policy.
- [ ] `codersvoice-api` is enabled and active.
- [ ] Port 5000 is not public.
- [ ] `store.codersvoice.me` and `api.store.codersvoice.me` both have valid HTTPS certificates.
- [ ] `VITE_API_BASE_URL` was set before the frontend build.
- [ ] `/etc/codersvoice/store-api.env` contains all production variables and has `640` permissions.
- [ ] MongoDB Atlas permits only the required Oracle source IP/network.
- [ ] Razorpay is set to live mode; Resend sender/domain is verified.
- [ ] A real purchase, email delivery, protected download, report export, and Cloudinary upload have been tested.
- [ ] `ADMIN_BOOTSTRAP_PASSWORD` was removed or rotated after the first administrator was created.
