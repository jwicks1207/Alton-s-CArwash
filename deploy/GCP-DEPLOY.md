# Deploy Alton's Carwash on Google Cloud (Compute Engine VM)

This guide walks you through deploying the site on a **Google Cloud VM** with Nginx, HTTPS, and a systemd service so it stays running after reboot.

**Estimated time:** 30–45 minutes  
**Monthly cost (approx.):** ~$7–15 for an `e2-small` VM (varies by region)

---

## Part 1 — Create the VM in Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a **project**
3. Go to **Compute Engine → VM instances**
4. Click **Create instance**
5. Suggested settings:

   | Setting | Value |
   |--------|--------|
   | Name | `altons-carwash` |
   | Region | Closest to your customers |
   | Machine type | `e2-small` (2 vCPU, 2 GB RAM) |
   | Boot disk | **Ubuntu 22.04 LTS**, 20 GB |
   | Firewall | Check **Allow HTTP traffic** and **Allow HTTPS traffic** |

6. Click **Create**
7. Note the **External IP** (e.g. `34.123.45.67`)

### Optional: Reserve a static IP

**VPC network → IP addresses → Reserve external static address** → attach to your VM so the IP does not change on restart.

---

## Part 2 — Open firewall ports (if needed)

1. **VPC network → Firewall**
2. Ensure these exist (GCP often creates them when you check HTTP/HTTPS on the VM):

   - `default-allow-http` — TCP **80**
   - `default-allow-https` — TCP **443**

3. SSH uses **22** (default `default-allow-ssh`)

---

## Part 3 — Connect to the VM

### From Cloud Console

1. On the VM list, click **SSH** next to your instance

### From your computer (PowerShell)

```bash
gcloud compute ssh altons-carwash --zone=YOUR_ZONE
```

Replace `YOUR_ZONE` (e.g. `us-central1-a`) with your VM’s zone.

---

## Part 4 — Upload the project to the VM

Pick **one** method.

### Option A — Git (recommended)

On your PC, push the project to GitHub/GitLab, then on the VM:

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/YOUR_USER/altons-carwash.git
cd altons-carwash
```

### Option B — Copy files with `gcloud scp` (from your PC)

```powershell
gcloud compute scp --recurse "C:\Users\Jwick\Desktop\Alton's CArwash" altons-carwash:/var/www/altons-carwash --zone=YOUR_ZONE
```

On the VM, rename if needed:

```bash
sudo mkdir -p /var/www
sudo mv ~/altons-carwash /var/www/ 2>/dev/null || true
```

---

## Part 5 — Run the server setup script

On the VM (in the project folder):

```bash
cd /var/www/altons-carwash
chmod +x deploy/*.sh
./deploy/setup-vm.sh
```

This installs Node.js 20, Nginx, creates folders, and prepares the app user.

---

## Part 6 — Configure environment variables

```bash
cd /var/www/altons-carwash
cp deploy/.env.production.example .env
nano .env
```

Set these **before** building:

| Variable | Example |
|----------|---------|
| `NEXTAUTH_URL` | `http://YOUR_EXTERNAL_IP` or `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | Run: `openssl rand -base64 32` |
| `DATABASE_URL` | `file:/var/www/altons-carwash/prisma/dev.db` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

Save (`Ctrl+O`, Enter, `Ctrl+X`).

---

## Part 7 — Deploy the application

```bash
cd /var/www/altons-carwash
./deploy/deploy.sh
```

This will:

- Install npm dependencies
- Create/sync the database
- Seed admin user (first run only)
- Build Next.js
- Start the app with **systemd**
- Configure **Nginx** as reverse proxy

---

## Part 8 — Test the site

Open in a browser:

- **http://YOUR_EXTERNAL_IP**
- Admin: **http://YOUR_EXTERNAL_IP/admin/login**

Default login:

- Email: `admin@altonscarwash.com`
- Password: `changeme123` — **change immediately in production**

---

## Part 9 — Add HTTPS (recommended)

If you have a domain (e.g. `altonscarwash.com`) pointing to the VM IP:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Then update `.env`:

```env
NEXTAUTH_URL="https://yourdomain.com"
```

Redeploy:

```bash
cd /var/www/altons-carwash
./deploy/deploy.sh
```

---

## Updating the site later

After you change code (git pull or upload new files):

```bash
cd /var/www/altons-carwash
git pull   # if using git
./deploy/deploy.sh
```

---

## Useful commands on the VM

| Task | Command |
|------|---------|
| App status | `sudo systemctl status altons-carwash` |
| App logs | `sudo journalctl -u altons-carwash -f` |
| Restart app | `sudo systemctl restart altons-carwash` |
| Nginx test | `sudo nginx -t` |
| Nginx reload | `sudo systemctl reload nginx` |

---

## Email on the VM

Configure SMTP in **Admin → Settings & Email** after the site is live, or set `SMTP_*` in `.env`.

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password.

---

## Troubleshooting

### “Connection failed” / site won’t load

1. VM is **running** in Cloud Console  
2. Firewall allows **80** and **443**  
3. App is running: `sudo systemctl status altons-carwash`  
4. Nginx is running: `sudo systemctl status nginx`  

### App crashes on start

```bash
sudo journalctl -u altons-carwash -n 50 --no-pager
```

Common fixes:

- Wrong `DATABASE_URL` — use absolute path: `file:/var/www/altons-carwash/prisma/dev.db`
- Missing `.env` or `NEXTAUTH_SECRET`
- Run `./deploy/deploy.sh` again after fixing `.env`

### Out of memory during build

Use a larger machine temporarily (`e2-medium`), build, then resize down — or add swap:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Backup the database

SQLite file location:

```bash
/var/www/altons-carwash/prisma/dev.db
```

Copy it periodically:

```bash
cp /var/www/altons-carwash/prisma/dev.db ~/backups/dev-$(date +%Y%m%d).db
```

Consider **Cloud Storage** scheduled backups for production.
