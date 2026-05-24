# Enable HTTPS (SSL) — Step by Step

You need a **domain name** (e.g. `altonscarwash.com`). Let's Encrypt does not issue certs for a bare IP like `136.114.207.246`.

---

## Step 1 — DNS (at your domain registrar)

Add an **A record**:

| Type | Host | Value |
|------|------|--------|
| A | `@` | Your VM external IP (e.g. `136.114.207.246`) |
| A | `www` | Same IP (optional) |

Wait until it works:

```bash
ping yourdomain.com
```

---

## Step 2 — GCP firewall

**VPC network → Firewall** — ensure these exist:

- `tcp:80` (HTTP — required for certificate validation)
- `tcp:443` (HTTPS)

---

## Step 3 — Confirm HTTP works

In a browser: `http://yourdomain.com`  
You should see the car wash site (not timeout).

On the VM:

```bash
curl -I http://yourdomain.com
```

Expect `HTTP/1.1 200` or `301`.

---

## Step 4 — Run SSL script on the VM

SSH in:

```bash
cd /var/www/altons-carwash
git pull
chmod +x deploy/setup-ssl.sh
sudo ./deploy/setup-ssl.sh yourdomain.com www.yourdomain.com
```

Replace `yourdomain.com` with your real domain.

The script will:

- Install Certbot
- Get a free certificate
- Configure Nginx for HTTPS + HTTP→HTTPS redirect
- Set `NEXTAUTH_URL=https://yourdomain.com` in `.env`
- Restart the app

---

## Step 5 — Test

- https://yourdomain.com
- https://yourdomain.com/admin/login

Use a fresh browser tab or incognito. Clear old cookies if login acted weird before.

---

## Manual Certbot (if you prefer)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Then edit `.env`:

```env
NEXTAUTH_URL="https://yourdomain.com"
```

```bash
sudo systemctl restart altons-carwash
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Certbot "connection" failed | DNS not propagated; port 80 blocked |
| Login still broken | `NEXTAUTH_URL` must be `https://` + restart app |
| Certificate expired later | Auto-renew: `certbot renew` (cron installed by certbot) |

```bash
sudo certbot renew --dry-run
```
