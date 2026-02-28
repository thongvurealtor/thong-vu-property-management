# Property Management

A full-stack property management web app built with Next.js 16, Prisma 7, PostgreSQL, and Tailwind CSS.

## Features

- **Dashboard** – Summary of properties, tenants, active leases, open maintenance, and overdue payments
- **Properties** – List, add, edit, delete properties with status tracking
- **Tenants** – Manage tenant contacts and view their lease/payment history
- **Leases** – Create and track lease agreements with status (Active / Expired / Terminated)
- **Maintenance** – Log and track maintenance requests by priority and status
- **Payments** – Record and track payments with one-click "Mark Paid"

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: PostgreSQL (via Prisma 7 + `@prisma/adapter-pg`)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

---

## Local Development

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (local or cloud — [Neon](https://neon.tech) and [Supabase](https://supabase.com) both offer free tiers)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example and fill in your database URL:

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

> For Neon or Supabase, use the **pooled** connection string.

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. (Optional) Seed sample data

```bash
npm run db:seed
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Connect the repo in [Vercel](https://vercel.com).
3. Set the `DATABASE_URL` environment variable in Vercel → Project → Settings → Environment Variables.
4. Deploy. Vercel will automatically run `npm install` (which triggers `prisma generate`).
5. After the first deploy, run migrations against production once:

```bash
DATABASE_URL="your-production-url" npm run db:deploy
```

---

## Project Structure

```
app/
  app/
    dashboard/          # All dashboard pages (layout + modules)
      page.tsx          # Summary dashboard
      properties/
      tenants/
      leases/
      maintenance/
      payments/
    api/                # REST API routes (CRUD for each resource)
    layout.tsx
    page.tsx            # Redirects to /dashboard
  components/
    Sidebar.tsx
    forms/              # React Hook Form components per resource
    ui/                 # Button, Input, Select, Card, Modal, Badge
  lib/
    prisma.ts           # Prisma client singleton
    validations/        # Zod schemas
  prisma/
    schema.prisma       # Database models
    seed.ts             # Sample data seed
```
