# Deployment Guide for Hostinger

## Initial Setup on Hostinger

### 1. Database Setup
1. Log in to Hostinger control panel
2. Create a new MySQL database
3. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (usually localhost or 127.0.0.1)

### 2. SSH Access Setup
1. Enable SSH access in Hostinger control panel
2. Get your SSH credentials:
   - SSH username
   - SSH password/key
   - SSH port (usually 22)

### 3. Domain Configuration
- Subdomain: `jobs.cameralksrore.com`
- Point document root to: `public_html/backend/public`

## First Time Deployment

### Step 1: Connect via SSH
```bash
ssh your_username@your_server_ip -p 22
```

### Step 2: Navigate to public_html
```bash
cd public_html
```

### Step 3: Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Step 4: Setup Backend
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your production settings
```

Update these values in .env:
- `APP_KEY=` (generate using: `php artisan key:generate`)
- `DB_DATABASE=your_database_name`
- `DB_USERNAME=your_database_user`
- `DB_PASSWORD=your_database_password`
- `APP_URL=https://jobs.cameralksrore.com`

### Step 5: Install Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### Step 6: Setup Application
```bash
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force  # If you have seeders
php artisan storage:link
```

### Step 7: Set Permissions
```bash
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs
```

### Step 8: Setup Frontend
```bash
cd ../  # Go back to root
npm install
npm run build
```

### Step 9: Configure Web Server
Create `.htaccess` in backend/public if not exists:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## Subsequent Deployments

After pushing changes to GitHub, SSH into your server and run:

```bash
cd public_html/YOUR_REPO_NAME
chmod +x backend/deploy.sh
./backend/deploy.sh
```

Or manually:
```bash
git pull origin main
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Environment Variables to Configure

**Required:**
- `APP_KEY` - Generate using `php artisan key:generate`
- `DB_DATABASE` - Your Hostinger database name
- `DB_USERNAME` - Your Hostinger database username
- `DB_PASSWORD` - Your Hostinger database password
- `MAIL_USERNAME` - Your email for SMTP
- `MAIL_PASSWORD` - Your email password

**Optional:**
- `MAIL_HOST` - smtp.hostinger.com
- `MAIL_PORT` - 587
- `MAIL_ENCRYPTION` - tls

## Troubleshooting

### 500 Internal Server Error
1. Check storage permissions: `chmod -R 775 storage`
2. Clear cache: `php artisan optimize:clear`
3. Check error logs: `tail -f storage/logs/laravel.log`

### Database Connection Error
1. Verify .env database credentials
2. Check if database exists in Hostinger panel
3. Test connection: `php artisan tinker` then `DB::connection()->getPdo();`

### CORS Issues
Update `config/cors.php` if needed with your frontend domain.

## Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production` in .env
- [ ] Strong `APP_KEY` generated
- [ ] Database credentials secured
- [ ] `.env` file not in Git (check .gitignore)
- [ ] File permissions set correctly
- [ ] SSL certificate installed (HTTPS)
- [ ] Session domain configured properly

## Post-Deployment

1. Test the application: https://jobs.cameralksrore.com
2. Verify API endpoints work
3. Check database connectivity
4. Test authentication flow
5. Monitor error logs: `storage/logs/laravel.log`
