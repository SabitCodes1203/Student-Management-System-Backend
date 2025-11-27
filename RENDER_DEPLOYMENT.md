## Deploying `auth-backend` on Render (No Docker)

These steps walk through deploying the NestJS authentication backend to Render as a Node service without Docker.

### 1. Prepare the Repository
- Ensure `auth-backend/` is committed to a GitHub, GitLab, or Bitbucket repository.
- Include critical files in the repo:
  - `package.json`, `package-lock.json`
  - `src/`, `prisma/`, and `migrations/`
  - Any TypeScript config files (`tsconfig*.json`) and Nest configuration (`nest-cli.json`)
  - An `.env.example` outlining required environment variables (optional but helpful).

### 2. Set Up the Database
- Render requires a hosted Postgres instance for Prisma:
  1. In Render, choose **New → PostgreSQL** and create a database.
  2. Once provisioned, copy the **Internal Database URL**; you will use this for `DATABASE_URL`.

### 3. Create the Render Web Service
1. In Render, click **New → Web Service**.
2. Connect the Git provider and choose the repository containing `auth-backend/`.
3. Set the **Root Directory** to `auth-backend` (Render shows this option after selecting the repo).
4. Choose **Node** for the runtime environment.

### 4. Configure Build & Start Commands
- **Build Command**  
  `npm install && npm run db:generate && npm run build`
  - Installs dependencies.
  - Runs `prisma generate` to ensure the Prisma client matches the schema.
  - Compiles NestJS into `dist/`.

- **Start Command**  
  `npm run start:prod`
  - Launches the compiled NestJS server (`node dist/main`).

### 5. Add Environment Variables
Render’s **Environment** section must include all required keys:

| Key            | Value / Notes                                                                 |
|----------------|-------------------------------------------------------------------------------|
| `DATABASE_URL` | Paste the Internal Database URL from the Render Postgres service.             |
| `JWT_SECRET`   | Set to a strong random string.                                                |
| `JWT_EXPIRES_IN` | e.g. `7d` (matches the default in `auth.module.ts`).                        |
| Any others     | Add email, logging, or third-party credentials your service expects.          |
| `NODE_ENV`     | `production` (Render sets this automatically, add explicitly if needed).      |

> Tip: If you have an `.env.example`, match and fill each variable in Render.

### 6. Run Database Migrations
- Under **Advanced → Post-deploy Command**, add:
  ```
  npm run db:migrate
  ```
  This runs `prisma migrate deploy` on every successful build to keep the database in sync.
- For the very first deploy, you can also open the Render shell (once the service exists) and run:
  ```
  npm run db:migrate
  ```
  to seed the schema manually before traffic hits the service.

### 7. Deploy
1. Click **Create Web Service**. Render will:
   - Clone the repo.
   - Run the build command.
   - Execute the post-deploy migration command.
   - Start the service with `start:prod`.
2. Watch logs for:
   - Successful `npm install`.
   - Successful Prisma generation/build.
   - Migration deployment output (`prisma migrate deploy`).
   - NestJS boot logs (should show listening port, typically 10000).

### 8. Verify the Deployment
- After the deploy succeeds, hit the Render-generated URL.
- Recommended smoke tests:
  - `POST /auth/register` with test credentials.
  - `POST /auth/login` to confirm JWT issuance.
  - Any protected route using the returned token.
- If requests fail, review the service logs for missing env vars or migration errors.

### 9. Enable Continuous Deploys (Optional)
- In the service dashboard, enable **Auto Deploy** so every push to the selected branch redeploys.
- Keep the Post-deploy command to ensure schema changes migrate automatically with each release.

### 10. Post-Deployment Upkeep
- For schema changes, commit new Prisma migrations and push. Render’s next deploy will run them.
- Rotate secrets by updating environment variables in Render and redeploying.
- Consider adding health check routes or monitoring for better visibility.

Your NestJS authentication backend should now be live on Render without using Docker.

