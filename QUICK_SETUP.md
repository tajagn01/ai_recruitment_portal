# Quick Setup Guide - Fix "Nothing Showing on Frontend"

## Problem
The frontend is not showing any users/candidates because:
1. Database is not connected or migrated
2. No data in the database
3. Prisma client might not be generated

## Solution Steps

### Option 1: Use SQLite (Easiest for Local Development)

1. **Update Prisma Schema for SQLite:**
   Edit `prisma/schema.prisma` and change:
   ```prisma
   datasource db {
     provider = "sqlite"  // Change from "postgresql"
     url      = "file:./dev.db"  // Change from env("DATABASE_URL")
   }
   ```

2. **Update .env file:**
   You can remove or comment out DATABASE_URL for SQLite

3. **Run setup commands:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db push
   ```

4. **Seed the database:**
   ```bash
   # Using curl or Postman, make a POST request to:
   # http://localhost:3000/api/seed
   # Or use the browser console:
   fetch('/api/seed', { method: 'POST' })
     .then(r => r.json())
     .then(console.log)
   ```

### Option 2: Fix PostgreSQL Connection

1. **Update .env file with correct DATABASE_URL:**
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
   ```

2. **For Neon (Cloud PostgreSQL):**
   - Go to your Neon dashboard
   - Copy the connection string
   - Make sure it includes `?sslmode=require` at the end
   - Update .env file

3. **For Local PostgreSQL:**
   - Install PostgreSQL if not installed
   - Create a database: `createdb recruitment_db`
   - Update .env: `DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment_db"`

4. **Run setup:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed the database:**
   Make a POST request to `/api/seed`

### Option 3: Use Online Database (Supabase/Neon)

1. **Create a free account:**
   - Supabase: https://supabase.com
   - Neon: https://neon.tech

2. **Get connection string** from dashboard

3. **Update .env:**
   ```
   DATABASE_URL="your_connection_string_here"
   ```

4. **Run setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed data:**
   POST to `/api/seed`

## After Setup - Verify

1. **Check if data exists:**
   ```bash
   node setup-database.js
   ```

2. **Or use Prisma Studio:**
   ```bash
   npx prisma studio
   ```

3. **Refresh your frontend page** - candidates should now appear!

## Troubleshooting

### "Can't reach database server"
- Check your DATABASE_URL is correct
- Verify database is running (for local)
- Check firewall/network settings

### "Table does not exist"
- Run: `npx prisma migrate dev` or `npx prisma db push`

### "Prisma Client not generated"
- Run: `npx prisma generate`
- Make sure no dev server is running when generating

### Still no data showing?
- Check browser console for errors
- Check server logs
- Verify API endpoint `/api/candidates` returns data
- Make sure you seeded the database
