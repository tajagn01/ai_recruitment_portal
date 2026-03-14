# Prisma Setup Guide

## Prerequisites
1. Make sure you have a PostgreSQL database running
2. Update your `.env` file with the correct `DATABASE_URL`

## Setup Steps

### 1. Configure Database URL
Edit your `.env` file and set the `DATABASE_URL`:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

**Examples:**
- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/recruitment_db`
- Neon (cloud): `postgresql://user:password@host.neon.tech:5432/dbname?sslmode=require`

### 2. Generate Prisma Client
```bash
npm run prisma:generate
# or
npx prisma generate
```

### 3. Create and Run Migrations
```bash
npm run prisma:migrate
# or
npx prisma migrate dev --name init
```

**Alternative: Push Schema (for development)**
If you prefer to push the schema without creating migration files:
```bash
npm run prisma:push
# or
npx prisma db push
```

### 4. (Optional) Open Prisma Studio
View and edit your database in a GUI:
```bash
npm run prisma:studio
# or
npx prisma studio
```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations (development)
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:push` - Push schema changes to database (development)
- `npm run prisma:studio` - Open Prisma Studio GUI

## Troubleshooting

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- Ensure your database server is running
- Check firewall settings if using a remote database
- For Neon databases, make sure the connection string includes `?sslmode=require`

### Permission Errors
- Close any running Next.js dev servers
- Close Prisma Studio if it's open
- Try running the command again

### Migration Issues
- If migrations fail, you can use `prisma db push` for development
- For production, always use `prisma migrate deploy`
