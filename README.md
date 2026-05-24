# Alton's Carwash Website

A Next.js website for a car wash business with online booking, email notifications, and a secure admin dashboard.

## Features

### Public site
- **Home** — Hero, about, services, contact (all editable in admin)
- **Testimonials** — Customer reviews
- **Gallery** — Photo showcase
- **Book Now** — Appointment form (Name, Phone, Car Type, Date, Time, Comments)

### Admin (`/admin`)
- Secure login (NextAuth credentials)
- Customize all site content, services, hours, contact info
- Manage testimonials and gallery images
- Configure notification email + SMTP for appointment emails
- **Appointments**: color-coded calendar (Booked = blue, Confirmed = green, Canceled = red)
- Sections: Booked (with Confirm button), Confirmed, Canceled
- Add call-in appointments manually
- Cancel / rebook appointments

## Quick start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment**
   Copy `.env.example` to `.env` and set:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-long-random-secret"
   ```

   Generate a secret:
   ```bash
   openssl rand -base64 32
   ```

3. **Database**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Run**
   ```bash
   npm run dev
   ```

5. **Open**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin/login

### Default admin login
- Email: `admin@altonscarwash.com`
- Password: `changeme123`

**Change the password after first login** (update via database or add a change-password feature later).

## Email setup

1. Go to **Admin → Settings & Email**
2. Set **Notification Email** (where appointment details are sent)
3. Configure SMTP (Gmail example: `smtp.gmail.com`, port `587`, app password)

Alternatively, set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env`.

## Tech stack

- Next.js 15 (App Router)
- Prisma + SQLite
- NextAuth.js
- Nodemailer

## Deployment (Google Cloud VM)

Full step-by-step guide: **[deploy/GCP-DEPLOY.md](deploy/GCP-DEPLOY.md)**

Quick overview:

1. Create an Ubuntu VM in Google Cloud (enable HTTP + HTTPS firewall).
2. Upload the project to `/var/www/altons-carwash`.
3. On the VM: `./deploy/setup-vm.sh` then configure `.env` then `./deploy/deploy.sh`.

Set `NEXTAUTH_URL` to your public IP or domain and a strong `NEXTAUTH_SECRET` (see `deploy/.env.production.example`).
