# Deploying auth-backend to Vercel

This guide will help you deploy your NestJS authentication backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A database (PostgreSQL recommended) - you can use:
   - Vercel Postgres
   - Supabase
   - Railway
   - Neon
   - Any PostgreSQL database with a connection string

## Step 1: Prepare Your Repository

Make sure all necessary files are committed:
- `package.json` and `package-lock.json`
- `src/` directory
- `prisma/` directory (schema and migrations)
- `api/index.ts` (serverless entry point)
- `vercel.json` (Vercel configuration)
- `tsconfig.json` and other config files

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your Git repository
4. **Important**: Set the **Root Directory** to `auth-backend`
5. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: Leave empty (not needed for serverless)
   - **Install Command**: `npm install`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to auth-backend directory
cd auth-backend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set root directory to ./ (if deploying from auth-backend folder)
# - Override settings? No (use vercel.json)
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens | Generate a strong random string |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` (7 days) |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` (auto-set by Vercel) |
| `APP_PORT` | Port number | Not needed (Vercel handles this) |
| `APP_COOKIE_NAME` | Auth cookie name | `auth_token` |
| `EMAIL_HOST` | SMTP host for emails | Required if using email features |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | Required if using email features |
| `EMAIL_PASS` | SMTP password | Required if using email features |
| `EMAIL_FROM` | Email sender address | `no-reply@example.com` |

### Generating JWT_SECRET

You can generate a secure JWT secret using:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

## Step 4: Run Database Migrations

After the first deployment, you need to run Prisma migrations:

### Option A: Using Vercel CLI

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

### Option B: Using Vercel Postgres

If you're using Vercel Postgres, migrations can be run automatically. Check Vercel's documentation for Postgres integration.

### Option C: Manual Migration

Connect to your database and run:

```bash
# Set DATABASE_URL in your local environment
export DATABASE_URL="your-database-url"

# Run migrations
npx prisma migrate deploy
```

## Step 5: Verify Deployment

1. Check the deployment logs in Vercel dashboard
2. Visit your deployment URL (e.g., `https://your-project.vercel.app`)
3. Test the API endpoints:
   - `GET /` - Health check
   - `POST /auth/register` - Register a new user
   - `POST /auth/login` - Login

## Troubleshooting

### Function Crashes on Startup

1. **Check Environment Variables**: Ensure all required variables are set
2. **Check Logs**: Go to Vercel dashboard → Your deployment → Functions → View logs
3. **Verify Database Connection**: Make sure `DATABASE_URL` is correct and database is accessible
4. **Check Prisma Client**: Ensure `prisma generate` runs during build (it's in the build script)

### Common Issues

- **"Cannot find module"**: Make sure `npm run build` completes successfully
- **"Prisma Client not generated"**: Check that `prisma generate` is in the build script
- **Database connection errors**: Verify `DATABASE_URL` format and database accessibility
- **JWT errors**: Ensure `JWT_SECRET` is set

### Viewing Logs

```bash
# Using Vercel CLI
vercel logs [deployment-url]

# Or check in Vercel dashboard:
# Project → Deployments → Click on deployment → Functions → View logs
```

## Project Structure

```
auth-backend/
├── api/
│   └── index.ts          # Serverless function entry point
├── src/                  # Source code
├── prisma/               # Database schema and migrations
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── .vercelignore         # Files to exclude from deployment
```

## Continuous Deployment

Vercel automatically deploys on every push to your main branch. To configure:

1. Go to **Settings → Git**
2. Select the branch for auto-deployment
3. Enable **Auto Deploy**

## Next Steps

- Set up custom domain (optional)
- Configure CORS for your frontend domain
- Set up monitoring and alerts
- Configure environment-specific variables (Production, Preview, Development)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review the error messages in the function logs
3. Verify all environment variables are set correctly
4. Ensure database is accessible and migrations are run

