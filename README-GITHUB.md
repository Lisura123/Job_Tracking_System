# GitHub Repository Setup and Deployment Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "job-tracking-system")
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)

## Step 2: Push Code to GitHub

Open terminal in your project root and run:

```bash
cd "/Applications/XAMPP/xamppfiles/htdocs/Job Tracking System"

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit: Job Tracking System"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/job-tracking-system.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Setup GitHub Secrets for Auto-Deployment

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SSH_HOST` | Your Hostinger server IP or domain | e.g., `123.45.67.89` |
| `SSH_USERNAME` | Your SSH username | From Hostinger panel |
| `SSH_PASSWORD` | Your SSH password | From Hostinger panel |
| `SSH_PORT` | SSH port | Usually `22` |

## Step 4: Hostinger Initial Setup

### A. Connect via SSH

```bash
ssh your_username@your_server_ip -p 22
```

### B. Navigate and Clone

```bash
cd public_html
git clone https://github.com/YOUR_USERNAME/job-tracking-system.git
cd job-tracking-system
```

### C. Setup Backend

```bash
cd backend
cp .env.example .env
nano .env  # Edit configuration
```

**Required .env changes:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://jobs.cameralksrore.com
DB_DATABASE=your_hostinger_db_name
DB_USERNAME=your_hostinger_db_user
DB_PASSWORD=your_hostinger_db_password
SESSION_DOMAIN=.cameralksrore.com
SANCTUM_STATEFUL_DOMAINS=jobs.cameralksrore.com
```

### D. Install and Setup

```bash
# Install composer dependencies
composer install --no-dev --optimize-autoloader

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Create admin user (optional)
php artisan db:seed --force

# Link storage
php artisan storage:link

# Set permissions
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs

# Cache configs
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### E. Build Frontend

```bash
cd ..  # Back to root
npm install
npm run build
```

### F. Configure Subdomain

**In Hostinger Control Panel:**

1. Go to **Domains** → **Subdomains**
2. Create subdomain: `jobs`
3. Set document root to: `public_html/job-tracking-system/dist`

**For API (Backend):**
- May need to configure a separate subdomain or path routing
- Option 1: Use same domain with /api route
- Option 2: Create api.cameralksrore.com subdomain pointing to `backend/public`

## Step 5: Verify SSL Certificate

1. In Hostinger panel, go to **SSL**
2. Ensure SSL is enabled for `jobs.cameralksrore.com`
3. Force HTTPS if not already enabled

## Step 6: Test Deployment

Visit: `https://jobs.cameralksrore.com`

Check:
- ✅ Frontend loads
- ✅ API connectivity
- ✅ Login works
- ✅ Database operations work

## Future Deployments

After making changes:

```bash
# Commit changes
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Actions will automatically:
1. SSH into your server
2. Pull latest code
3. Run composer install
4. Run migrations
5. Clear and rebuild cache

**Or manually deploy via SSH:**

```bash
ssh your_username@your_server_ip -p 22
cd public_html/job-tracking-system
chmod +x backend/deploy.sh
./backend/deploy.sh
```

## Directory Structure on Hostinger

```
public_html/
├── job-tracking-system/          # Your repo
│   ├── backend/                  # Laravel backend
│   │   ├── public/              # Backend entry point
│   │   ├── app/
│   │   ├── config/
│   │   └── .env                 # Production config
│   ├── src/                     # React source
│   ├── dist/                    # Built frontend (production)
│   ├── .github/
│   └── package.json
```

## Troubleshooting

### Issue: 500 Error
```bash
cd backend
php artisan optimize:clear
chmod -R 775 storage
tail -f storage/logs/laravel.log
```

### Issue: API not connecting
- Verify CORS settings in `backend/config/cors.php`
- Check `.env` has correct `APP_URL`
- Verify frontend `.env.production` has correct `VITE_API_URL`

### Issue: Database connection failed
- Check database credentials in `.env`
- Verify database exists in Hostinger panel
- Test: `php artisan tinker` → `DB::connection()->getPdo();`

### Issue: Auto-deployment not working
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Check SSH connection manually

## Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] Strong database password
- [ ] `.env` not committed to Git
- [ ] File permissions set correctly
- [ ] SSL certificate active
- [ ] CORS configured properly
- [ ] Session domain set correctly
- [ ] API rate limiting enabled

## Maintenance Commands

```bash
# View logs
tail -f backend/storage/logs/laravel.log

# Clear all cache
php artisan optimize:clear

# Run migrations
php artisan migrate --force

# Rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
