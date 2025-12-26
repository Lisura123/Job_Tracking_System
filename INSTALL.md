## Installation Steps

Follow these steps to set up the Job Tracking System:

### 1. Prerequisites Check

Ensure you have:
- ✅ XAMPP installed and running
- ✅ Composer installed globally
- ✅ Node.js 16+ and npm installed
- ✅ MySQL running in XAMPP

### 2. Quick Start Commands

```bash
# Step 1: Create Database
# Open XAMPP phpMyAdmin (http://localhost/phpmyadmin)
# Click "New" and create database: job_tracking_system

# Step 2: Setup Backend
cd "/Applications/XAMPP/xamppfiles/htdocs/Job Tracking System/backend"

# Install dependencies (if composer is available)
composer install

# If composer is not available, download it first:
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"
php composer.phar install

# Copy environment file
cp .env.example .env

# Edit .env file and set:
# DB_DATABASE=job_tracking_system
# DB_USERNAME=root
# DB_PASSWORD=

# Generate app key
php artisan key:generate

# Run migrations and seed data
php artisan migrate --seed

# Start Laravel server
php artisan serve
# Backend will run on http://localhost:8000

# Step 3: Setup Frontend (in a new terminal)
cd "/Applications/XAMPP/xamppfiles/htdocs/Job Tracking System"

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will run on http://localhost:5173
```

### 3. Access the Application

#### React Frontend
- URL: http://localhost:5173
- Admin Login: admin@jobtracking.com / password
- User Login: user@jobtracking.com / password

#### Filament Admin Panel
- URL: http://localhost:8000/admin
- Create admin: `php artisan make:filament-user`
- Or use: admin@jobtracking.com / password

### 4. Verify Installation

1. Open http://localhost:5173
2. Login with admin@jobtracking.com / password
3. You should see the search page
4. Try searching for "JOB2024001" to see sample data

### Common Issues & Solutions

**Issue: Composer not found**
```bash
# Install Composer globally on macOS
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
sudo mv composer.phar /usr/local/bin/composer
```

**Issue: Database connection error**
- Ensure MySQL is running in XAMPP
- Check database name in .env matches created database
- Verify DB_USERNAME=root and DB_PASSWORD is empty (or your XAMPP MySQL password)

**Issue: CORS errors**
- Ensure backend is running on port 8000
- Ensure frontend is running on port 5173
- Check backend/config/cors.php includes 'http://localhost:5173'

**Issue: 404 on API calls**
- Verify backend server is running: `php artisan serve`
- Check API_BASE_URL in src/services/api.ts is 'http://localhost:8000/api'

**Issue: npm install fails**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Production Deployment Notes

1. **Backend**:
   - Set `APP_ENV=production` in .env
   - Set `APP_DEBUG=false`
   - Run `php artisan config:cache`
   - Run `php artisan route:cache`
   - Set up proper database backups

2. **Frontend**:
   - Run `npm run build`
   - Serve `dist/` folder with nginx or Apache
   - Update API URL in production environment

3. **Security**:
   - Change all default passwords
   - Update `APP_KEY`
   - Enable HTTPS
   - Configure proper CORS origins
   - Set up rate limiting

### Next Steps

After successful installation:
1. Explore the sample data (3 jobs, 3 customers)
2. Try creating a new job as admin
3. Test search functionality with different queries
4. Access Filament admin panel for advanced features
5. Customize the system to your needs

### Support

If you encounter issues:
1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Check browser console for frontend errors
3. Verify all services are running (MySQL, Laravel, Vite)
4. Refer to the main README.md for detailed documentation
