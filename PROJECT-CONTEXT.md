# Alton's Carwash — Project Context & Thread Summary

> **Purpose:** Living reference from the build session (May 2026). Use this when resuming updates so you (or an AI assistant) can recall architecture, decisions, and deployment state without re-reading the full chat.

---

## Quick reference

| Item | Value |
|------|--------|
| **Business name (placeholder)** | Alton's Carwash |
| **GitHub** | https://github.com/jwicks1207/Alton-s-CArwash |
| **Local path** | `C:\Users\Jwick\Desktop\Alton's CArwash` |
| **Stack** | Next.js 15 (App Router), Prisma + SQLite, NextAuth, Nodemailer |
| **Admin login (change in prod)** | `admin@altonscarwash.com` / `changeme123` |
| **Database** | SQLite at `prisma/dev.db` (`DATABASE_URL=file:./prisma/dev.db`) |
| **Deploy target** | Google Cloud Compute Engine VM (Ubuntu) |
| **Recommended VM** | `e2-small` (2 vCPU, 2 GB RAM) for low–mid traffic |

---

## Session timeline (what we built)

```mermaid
timeline
    title Build & deploy session (May 2026)
    section Foundation
        Greenfield Next.js app : Home, Testimonials, Gallery, Book Now
        Admin dashboard : Auth, content, gallery, testimonials, settings
        Appointments : Booked / Confirmed / Canceled, calendar, call-ins
        Email : Nodemailer + admin SMTP settings
    section Fixes
        Connection failed : Dev server not running; port 3000 vs 3001
        DATABASE_URL : Fixed to file:./prisma/dev.db
        start.bat : One-click local run on Windows
    section Features v2
        Testimonials : Public submit, admin approve, live feed poll
        Mobile carwash : Address + zip, admin toggle, zip allowlist
    section Deploy prep
        deploy/ scripts : setup-vm.sh, deploy.sh, Nginx, systemd
        Git : Pushed to jwicks1207/Alton-s-CArwash (repo name matches folder spelling)
    section Pending on VM
        User to clone on GCP VM : setup-vm.sh → .env → deploy.sh
```

---

## System architecture

```mermaid
flowchart TB
    subgraph Public["Public site"]
        Home["/"]
        Testimonials["/testimonials"]
        Gallery["/gallery"]
        Book["/book"]
    end

    subgraph Admin["Admin (NextAuth)"]
        Login["/admin/login"]
        Dashboard["/admin"]
        Appts["/admin/appointments"]
        Content["/admin/content"]
        Settings["/admin/settings"]
        AdminTest["/admin/testimonials"]
        AdminGallery["/admin/gallery"]
    end

    subgraph API["API routes"]
        POST_App["POST /api/appointments"]
        GET_Test["GET/POST /api/testimonials"]
        AdminAPI["/api/admin/*"]
        Auth["/api/auth/*"]
    end

    subgraph Data["Persistence"]
        SQLite[(SQLite prisma/dev.db)]
        Prisma[Prisma Client]
    end

    subgraph External["External"]
        SMTP[SMTP email]
    end

    Public --> API
    Admin --> AdminAPI
    API --> Prisma --> SQLite
    POST_App --> SMTP
    AdminAPI --> SMTP
    Login --> Auth
```

---

## Appointment lifecycle

```mermaid
stateDiagram-v2
    [*] --> BOOKED: Online booking or call-in
    BOOKED --> CONFIRMED: Admin clicks Confirm
    BOOKED --> CANCELED: Admin or customer cancel
    CONFIRMED --> CANCELED: Admin cancel
    CANCELED --> BOOKED: Admin Rebook

    note right of BOOKED
        Calendar color: blue #3b82f6
    end note
    note right of CONFIRMED
        Calendar color: green #22c55e
    end note
    note right of CANCELED
        Calendar color: red #ef4444
    end note
```

---

## Mobile car wash booking flow

```mermaid
flowchart TD
    A[Admin: Settings] --> B{mobileCarwashEnabled?}
    B -->|No| C[Booking form: no mobile checkbox]
    B -->|Yes| D[Show Mobile car wash checkbox]
    D --> E{Customer checks mobile?}
    E -->|No| F[Standard on-site booking]
    E -->|Yes| G[Require address + zip]
    G --> H{Zip in acceptedZipcodesJson?}
    H -->|No| I["Error: Zipcode not within service area."]
    H -->|Yes| J[Save appointment isMobile=true]
    J --> K[Email notification includes address/zip]

    A --> L[Admin edits zip list one per line]
    L --> M[Stored as acceptedZipcodesJson in SiteSettings]
```

---

## Testimonials flow

```mermaid
flowchart LR
    subgraph Public
        Form[Share Your Experience form]
        Feed[Live feed polls every 12s]
    end
    subgraph DB
        T[(Testimonial)]
    end
    subgraph Admin
        Pending[Pending tab]
        Approve[Approve button]
        Approved[Approved tab]
    end

    Form -->|POST /api/testimonials| T
    T -->|status PENDING| Pending
    Pending --> Approve
    Approve -->|status APPROVED| Approved
    Approved --> Feed
```

---

## Key files map

```mermaid
mindmap
  root((Alton's Carwash))
    Public pages
      src/app/public/page.tsx
      testimonials/page.tsx
      gallery/page.tsx
      book/page.tsx
    Components
      BookingForm.tsx
      TestimonialsPageContent.tsx
      admin/AppointmentsManager.tsx
      admin/SettingsEditor.tsx
    Lib
      lib/settings.ts
      lib/zipcodes.ts
      lib/booking-validation.ts
      lib/email.ts
    Data
      prisma/schema.prisma
      prisma/seed.ts
    Deploy
      deploy/GCP-DEPLOY.md
      deploy/deploy.sh
      deploy/setup-vm.sh
      start.bat
```

---

## Database models (Prisma)

```mermaid
erDiagram
    User ||--o{ SiteSettings : "admin only"
    SiteSettings {
        string id PK "default"
        boolean mobileCarwashEnabled
        string acceptedZipcodesJson
        string notificationEmail
        string smtpHost
        string servicesJson
        string hoursJson
    }
    Appointment {
        string id PK
        string name
        string phone
        string carType
        string date
        string time
        boolean isMobile
        string address
        string zipCode
        enum status "BOOKED|CONFIRMED|CANCELED"
        enum source "ONLINE|CALL_IN"
    }
    Testimonial {
        string id PK
        string name
        string quote
        int rating
        enum status "PENDING|APPROVED"
    }
    GalleryImage {
        string id PK
        string url
        string caption
    }
```

---

## Local development (Windows)

```mermaid
flowchart LR
    A[start.bat or npm run dev] --> B[localhost:3000]
    C[.env] --> D[DATABASE_URL file:./prisma/dev.db]
    C --> E[NEXTAUTH_SECRET]
    F[Folder name has apostrophe] --> G[Use start.bat or subst Z: path]

    H[npm run setup] --> I[prisma db push + seed]
```

**Known quirk:** Path `Alton's CArwash` breaks some PowerShell scripts; `subst Z: "C:\Users\Jwick\Desktop\Alton's CArwash"` works for terminal commands.

---

## GCP VM deployment flow

```mermaid
sequenceDiagram
    participant Dev as Your PC
    participant GH as GitHub
    participant VM as GCP VM
    participant Web as Browser

    Dev->>GH: git push main
    VM->>GH: git clone Alton-s-CArwash
    VM->>VM: ./deploy/setup-vm.sh
    VM->>VM: cp deploy/.env.production.example .env
    VM->>VM: nano .env (NEXTAUTH_URL, SECRET)
    VM->>VM: ./deploy/deploy.sh
    Note over VM: npm install, build, systemd, nginx
    Web->>VM: http://EXTERNAL_IP
```

**Clone command on VM:**
```bash
git clone https://github.com/jwicks1207/Alton-s-CArwash.git /var/www/altons-carwash
```

---

## Environment variables

| Variable | Local (.env) | Production (VM) |
|----------|--------------|-----------------|
| `DATABASE_URL` | `file:./prisma/dev.db` | `file:/var/www/altons-carwash/prisma/dev.db` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `http://IP` or `https://domain` |
| `NEXTAUTH_SECRET` | dev secret in .env | `openssl rand -base64 32` |
| `SMTP_*` | optional fallback | optional or set in Admin UI |

**Never commit:** `.env`, `prisma/**/*.db`

---

## Post-deploy checklist

- [ ] Change admin password from `changeme123`
- [ ] Set strong `NEXTAUTH_SECRET` on VM
- [ ] Configure notification email + SMTP in Admin → Settings
- [ ] Add HTTPS with Certbot if using a domain
- [ ] Update `NEXTAUTH_URL` to `https://domain` and re-run `./deploy/deploy.sh`
- [ ] Enable mobile carwash + zip codes when service launches
- [ ] Backup `prisma/dev.db` periodically

---

## Future update ideas (not yet built)

- Admin password change UI
- PostgreSQL for multi-VM / higher scale
- Image upload for gallery (currently URL-only)
- SMS notifications for appointments
- Customer booking confirmation email

---

## How to use this doc with AI

When starting a new chat for updates, say:

> Read `PROJECT-CONTEXT.md` in the Alton's Carwash repo for architecture and prior decisions.

Or attach this file so context is restored quickly.

---

*Last updated: May 24, 2026 — reflects state after git push to `jwicks1207/Alton-s-CArwash`.*
