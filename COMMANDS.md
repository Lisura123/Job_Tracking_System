# Common Tasks & Commands

## Starting the Application

### Option 1: Using npm scripts (Recommended)
```bash
# In project root, create these scripts in package.json:
npm run backend    # Starts Laravel server
npm run frontend   # Starts Vite dev server
npm run dev        # Already exists - starts Vite
```

### Option 2: Manual start
```bash
# Terminal 1 - Backend
cd backend && php artisan serve

# Terminal 2 - Frontend  
npm run dev
```

## Database Operations

### Reset Database (Fresh Start)
```bash
cd backend
php artisan migrate:fresh --seed
```

### Just Run Migrations
```bash
cd backend
php artisan migrate
```

### Just Seed Data
```bash
cd backend
php artisan db:seed
```

### Create New Migration
```bash
cd backend
php artisan make:migration create_table_name
```

## Creating Resources

### New API Controller
```bash
cd backend
php artisan make:controller Api/ControllerName
```

### New Model with Migration
```bash
cd backend
php artisan make:model ModelName -m
```

### New Filament Resource
```bash
cd backend
php artisan make:filament-resource ResourceName --generate
```

## User Management

### Create Admin User (Filament)
```bash
cd backend
php artisan make:filament-user
```

### Create User via Tinker
```bash
cd backend
php artisan tinker

# Then run:
$user = new App\Models\User();
$user->name = 'Your Name';
$user->email = 'email@example.com';
$user->password = Hash::make('password');
$user->role = 'admin';
$user->save();
```

## Debugging

### View Routes
```bash
cd backend
php artisan route:list
```

### Clear All Caches
```bash
cd backend
php artisan optimize:clear
```

### View Logs
```bash
# Laravel logs
tail -f backend/storage/logs/laravel.log

# Clear logs
> backend/storage/logs/laravel.log
```

### Test Database Connection
```bash
cd backend
php artisan tinker

# Run:
DB::connection()->getPdo();
```

## API Testing with cURL

### Register User
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@jobtracking.com",
    "password": "password"
  }'
```

### Search (with token)
```bash
curl -X GET "http://localhost:8000/api/search?query=JOB2024001" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

## Frontend Development

### Install New Package
```bash
npm install package-name
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Type Check
```bash
npm run typecheck
```

## Git Workflow

### Initial Commit
```bash
git init
git add .
git commit -m "Initial commit: Complete Job Tracking System"
```

### Create .gitignore
Already created, includes:
- node_modules/
- vendor/
- .env
- backend/storage/logs/
- dist/

## Database Backup

### Export Database
```bash
# From XAMPP directory
./bin/mysql/bin/mysqldump -u root job_tracking_system > backup.sql
```

### Import Database
```bash
./bin/mysql/bin/mysql -u root job_tracking_system < backup.sql
```

## Performance Optimization

### Production Laravel Config
```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Clear Optimization
```bash
cd backend
php artisan optimize:clear
```

## Troubleshooting Commands

### Permission Issues (Storage)
```bash
cd backend
chmod -R 775 storage bootstrap/cache
```

### Composer Issues
```bash
cd backend
composer dump-autoload
composer install --no-scripts
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -ti:8000 | xargs kill -9

# Find process using port 5173
lsof -ti:5173 | xargs kill -9
```

## Development Tips

### Hot Module Replacement (HMR)
Already configured in Vite - changes auto-reload

### Watch Laravel Logs in Real-time
```bash
cd backend
php artisan log:tail
# Or manually:
tail -f storage/logs/laravel.log
```

### API Testing with HTTPie (Alternative to cURL)
```bash
# Install: brew install httpie

# Login
http POST localhost:8000/api/login \
  email=admin@jobtracking.com \
  password=password

# Search with token
http GET localhost:8000/api/search?query=JOB2024001 \
  "Authorization: Bearer TOKEN"
```

## Quick Fixes

### "Class not found" Error
```bash
cd backend
composer dump-autoload
```

### CORS Error
Check backend/config/cors.php:
```php
'allowed_origins' => ['http://localhost:5173'],
```

### Session/Cookie Issues
Clear browser data and restart both servers

### Database Connection Error
1. Check MySQL is running in XAMPP
2. Verify credentials in backend/.env
3. Test: `php artisan tinker` then `DB::connection()->getPdo();`

## Useful Laravel Artisan Commands

```bash
# List all commands
php artisan list

# Help for specific command
php artisan help migrate

# Check Laravel version
php artisan --version

# Run scheduler (for cron jobs)
php artisan schedule:run

# Queue worker
php artisan queue:work

# Create symbolic link for storage
php artisan storage:link
```

## Environment-Specific Commands

### Development
```bash
# .env
APP_ENV=local
APP_DEBUG=true
```

### Production
```bash
# .env
APP_ENV=production
APP_DEBUG=false

# Then run:
php artisan config:cache
php artisan route:cache
php artisan optimize
```

---

**Keep this file handy for day-to-day development tasks!**
