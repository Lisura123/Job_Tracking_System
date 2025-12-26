# Job Tracking System - Quick Reference

## 🚀 Quick Start

### Start the Application
```bash
# Terminal 1 - Backend
cd backend
php artisan serve
# Runs on http://localhost:8000

# Terminal 2 - Frontend
npm run dev
# Runs on http://localhost:5173
```

## 🔐 Login Credentials

### React Frontend
- **Admin**: admin@jobtracking.com / password
- **User**: user@jobtracking.com / password

### Filament Admin Panel
- **URL**: http://localhost:8000/admin
- Create user: `php artisan make:filament-user`

## 📡 API Endpoints Reference

### Authentication
```bash
POST /api/register
POST /api/login
POST /api/logout
GET  /api/me
```

### Search (All Users)
```bash
GET /api/search?query={search_term}&page={page}
GET /api/jobs/{id}
```

### Admin Only
```bash
# Jobs
GET    /api/jobs
POST   /api/jobs
PUT    /api/jobs/{id}
DELETE /api/jobs/{id}

# Customers
GET    /api/customers
POST   /api/customers
PUT    /api/customers/{id}
DELETE /api/customers/{id}
```

## 🗄️ Database Schema Quick View

### Key Tables
- **users**: Authentication and role management
- **customers**: Customer information
- **jobs**: Main job tracking data
- **items**: Items associated with jobs
- **tracking_details**: Shipping tracking information

### Relationships
```
customers (1) ──→ (many) jobs
jobs (1) ──→ (many) items
jobs (1) ──→ (1) tracking_details
```

## 🛠️ Common Commands

### Laravel
```bash
# Migrations
php artisan migrate
php artisan migrate:fresh --seed

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Create Filament user
php artisan make:filament-user

# View routes
php artisan route:list
```

### Frontend
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📝 Sample Data

The system comes with 3 sample jobs:
1. **JOB2024001** - Customer: John Doe (CUST001)
2. **JOB2024002** - Customer: Jane Smith (CUST002)
3. **JOB2024003** - Customer: Tech Solutions (CUST003)

## 🔍 Testing the Search

Try searching for:
- `JOB2024001` (Job Number)
- `CUST001` (Customer Number)
- `+65 9123 4567` (Phone Number)

## 📁 Project Structure

```
backend/
├── app/
│   ├── Filament/Resources/    # Admin panel resources
│   ├── Http/Controllers/Api/  # API controllers
│   ├── Models/                # Eloquent models
│   └── Providers/
├── database/
│   ├── migrations/            # Database structure
│   └── seeders/               # Sample data
└── routes/
    └── api.php                # API routes

src/
├── components/
│   └── admin/                 # Admin components
├── contexts/                  # React contexts
├── pages/                     # Page components
├── services/                  # API services
└── App.tsx                    # Main app with routing
```

## 🐛 Troubleshooting

### Database Issues
```bash
# Check connection
php artisan tinker
>>> DB::connection()->getPdo();

# Reset database
php artisan migrate:fresh --seed
```

### CORS Issues
- Check `backend/config/cors.php`
- Verify `allowed_origins` includes your frontend URL

### Authentication Issues
- Clear browser localStorage
- Check token in browser DevTools > Application > Local Storage

### Port Already in Use
```bash
# Use different port for Laravel
php artisan serve --port=8001

# Update frontend API URL in src/services/api.ts
```

## 📊 Data Flow

```
User Input
    ↓
React Components
    ↓
API Service (axios)
    ↓
Laravel API Routes
    ↓
Controllers
    ↓
Models (Eloquent)
    ↓
MySQL Database
```

## 🎨 Key Features

✅ Multi-field search (job number, customer number, phone)
✅ Real-time job tracking
✅ Multiple items per job
✅ Complete shipping timeline
✅ Role-based access control
✅ Responsive design
✅ Toast notifications
✅ Form validation
✅ Pagination
✅ Filament admin panel
✅ RESTful API

## 📞 Support

Check these resources:
1. README.md - Full documentation
2. INSTALL.md - Detailed setup guide
3. Laravel logs - backend/storage/logs/laravel.log
4. Browser console - For frontend errors

## 🔒 Security Notes

- Change default passwords in production
- Update APP_KEY for production
- Use HTTPS in production
- Review CORS settings
- Enable rate limiting
- Implement regular backups

---

**Version**: 1.0.0
**Last Updated**: December 2024
