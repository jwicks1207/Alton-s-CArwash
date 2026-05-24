# Pre-deploy checklist

Use this before going live on a Google Cloud VM.

## Git (on your PC)

- [ ] `git init` in the project folder (if not done yet)
- [ ] Confirm `.env` is **not** tracked (`git status` should not list `.env`)
- [ ] Push to GitHub/GitLab (private repo recommended)

## On the VM (first deploy)

- [ ] Ubuntu 22.04 VM with HTTP + HTTPS firewall rules
- [ ] Clone repo to `/var/www/altons-carwash`
- [ ] `./deploy/setup-vm.sh`
- [ ] Copy `deploy/.env.production.example` → `.env` and fill in:
  - [ ] `NEXTAUTH_URL` = your public URL (`http://IP` or `https://domain`)
  - [ ] `NEXTAUTH_SECRET` = output of `openssl rand -base64 32`
  - [ ] `DATABASE_URL` = `file:/var/www/altons-carwash/prisma/dev.db`
- [ ] `./deploy/deploy.sh`

## After deploy (security)

- [ ] Log in to `/admin/login` and change default password (`changeme123`)
- [ ] Set notification email + SMTP in Admin → Settings
- [ ] Add HTTPS with Certbot if you have a domain
- [ ] Update `NEXTAUTH_URL` to `https://yourdomain.com` and run `./deploy/deploy.sh` again

## Optional (mobile car wash)

- [ ] Admin → Settings → enable **Mobile car wash** when ready
- [ ] Add accepted zip codes (one per line)

## Backup

- [ ] Schedule copies of `prisma/dev.db` (all appointments & content live here)
