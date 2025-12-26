# Job Tracking System

A complete job tracking and logistics management system with React frontend, Laravel backend, and MySQL database. The system allows users to search and view job details, while admins can manage all data through both a Filament admin panel and API-driven interfaces.

## Features

### User Features
- **Search Jobs**: Search by job number, customer number, or customer phone number
- **View Job Details**: Complete job information including customer details, items, tracking, and shipping timeline
- **Real-time Updates**: Live data from the backend API

### Admin Features
- **Job Management**: Create, read, update, and delete jobs with all related information
- **Customer Management**: Manage customer database
- **Items Tracking**: Track multiple items per job with serial numbers
- **Shipping Timeline**: Monitor complete shipping journey from LK to final delivery
- **Tracking Details**: Record shipping agent and tracking numbers
- **Delivery Confirmation**: Track who received items and confirmation status
- **Filament Admin Panel**: Beautiful admin interface at `/admin` endpoint

### Technical Features
- RESTful API with Laravel Sanctum authentication
- Role-based access control (User vs Admin)
- Responsive mobile-friendly design
- Toast notifications for user feedback
- Form validation on both frontend and backend
- Pagination for large datasets
- Protected routes and API endpoints

## Technology Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- React Toastify for notifications
- Lucide React for icons
- Vite as build tool

### Backend
- Laravel 12
- Filament PHP 4.x for admin panel
- Laravel Sanctum for API authentication
- MySQL database
- RESTful API architecture

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 16+ and npm
- MySQL 5.7+ or MariaDB
- XAMPP (or any PHP/MySQL stack)

## Installation Guide

### 1. Database Setup

Start XAMPP and ensure MySQL is running, then create the database:

```bash
# Open XAMPP MySQL shell or phpMyAdmin and run:
CREATE DATABASE job_tracking_system;
```

### 2. Backend Setup (Laravel)

```bash
# Navigate to the backend directory
cd "backend"

# Install Composer dependencies
composer install

# Copy environment file
cp .env.example .env

# Configure your database in .env file
# Update these values:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=job_tracking_system
DB_USERNAME=root
DB_PASSWORD=

# Generate application key
php artisan key:generate

# Run migrations to create tables
php artisan migrate

# Seed the database with sample data (includes admin and user accounts)
php artisan db:seed

# Install Filament PHP
composer require filament/filament:"^4.0"

# Create Filament user (admin for admin panel)
php artisan make:filament-user

# Start the Laravel development server
php artisan serve
```

The backend will run on `http://localhost:8000`
Filament admin panel will be available at `http://localhost:8000/admin`

### 3. Frontend Setup (React)

Open a new terminal window:

```bash
# Navigate to the project root
cd "/Applications/XAMPP/xamppfiles/htdocs/Job Tracking System"

# Install npm dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Default Login Credentials

### For React Frontend (API Login)

**Admin Account:**
- Email: `admin@jobtracking.com`
- Password: `password`

**Regular User Account:**
- Email: `user@jobtracking.com`
- Password: `password`

### For Filament Admin Panel

Use the admin account you created with `php artisan make:filament-user` command, or use the seeded admin credentials above.

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/me` - Get authenticated user

### Search (All authenticated users)
- `GET /api/search?query={query}&page={page}` - Search jobs
- `GET /api/jobs/{id}` - Get job details

### Admin Only
- `GET /api/jobs` - List all jobs (paginated)
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/{id}` - Update job
- `DELETE /api/jobs/{id}` - Delete job
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

## Database Schema

### Tables

#### users
- id (Primary Key)
- name
- email (Unique)
- password
- role (enum: 'user', 'admin')
- timestamps

#### customers
- id (Primary Key)
- customer_number (Unique, Indexed)
- name
- contact_number (Indexed)
- timestamps

#### jobs
- id (Primary Key)
- job_number (Unique, Indexed)
- customer_id (Foreign Key)
- original_case_number
- clk_case_number
- lk_shipped_date
- shipping_method (enum: 'Gomaz', 'Direct', 'By hand')
- company_received_date
- supplier_shipping_date
- warehouse_received_date
- received_confirmation_by
- shipped_from_singapore_date
- final_received_date
- received_by_person_name
- received_confirmation (boolean)
- timestamps

#### items
- id (Primary Key)
- job_id (Foreign Key, Indexed)
- name
- serial_number (Indexed)
- timestamps

#### tracking_details
- id (Primary Key)
- job_id (Foreign Key, Indexed)
- shipping_agent_name
- tracking_number (Indexed)
- timestamps

## Project Structure

```
Job Tracking System/
├── backend/                          # Laravel backend
│   ├── app/
│   │   ├── Filament/
│   │   │   └── Resources/           # Filament admin resources
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── Api/            # API controllers
│   │   │   └── Middleware/         # Custom middleware
│   │   ├── Models/                 # Eloquent models
│   │   └── Providers/              # Service providers
│   ├── config/                     # Configuration files
│   ├── database/
│   │   ├── migrations/             # Database migrations
│   │   └── seeders/                # Database seeders
│   └── routes/
│       └── api.php                 # API routes
├── src/                            # React frontend
│   ├── components/
│   │   ├── admin/                  # Admin-only components
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication context
│   ├── pages/
│   │   ├── AdminDashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── SearchPage.tsx
│   ├── services/
│   │   ├── api.ts                  # Axios instance
│   │   ├── authService.ts          # Auth API calls
│   │   └── jobService.ts           # Job/Customer API calls
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

## Usage Guide

### For Regular Users

1. **Login**: Navigate to the application and login with user credentials
2. **Search Jobs**: 
   - Enter job number (e.g., JOB2024001)
   - Enter customer number (e.g., CUST001)
   - Enter customer phone number
3. **View Details**: Click on any job to see complete details including:
   - Customer information
   - Job case numbers
   - All items with serial numbers
   - Complete shipping timeline
   - Tracking information
   - Delivery confirmation status

### For Administrators

#### Via React Frontend

1. **Login**: Use admin credentials
2. **Access Admin Dashboard**: Click "Admin Dashboard" in navigation
3. **Manage Jobs**:
   - Click "Add New Job" to create jobs
   - Fill in all required fields
   - Add multiple items with serial numbers
   - Add tracking information
   - Save to create/update
4. **Manage Customers**:
   - Switch to "Customers Management" tab
   - Add/edit/delete customer records
   - Customer number must be unique

#### Via Filament Admin Panel

1. Navigate to `http://localhost:8000/admin`
2. Login with Filament credentials
3. Use the beautiful Filament interface to:
   - Manage customers with advanced filtering
   - Create/edit jobs with relationship forms
   - Batch operations on multiple records
   - View statistics and reports

## Development

### Running in Development Mode

```bash
# Backend (Terminal 1)
cd backend
php artisan serve

# Frontend (Terminal 2)
cd "/Applications/XAMPP/xamppfiles/htdocs/Job Tracking System"
npm run dev
```

### Building for Production

```bash
# Frontend
npm run build

# The build files will be in the dist/ directory
# You can serve them with any static file server
```

### Running Migrations

```bash
cd backend

# Run all pending migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (drop all tables and re-migrate)
php artisan migrate:fresh

# Fresh migration with seeding
php artisan migrate:fresh --seed
```

## Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the frontend URL is added to `backend/config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
```

### Database Connection Issues
- Verify MySQL is running in XAMPP
- Check database credentials in `backend/.env`
- Ensure database `job_tracking_system` exists

### API Authentication Issues
- Clear browser localStorage
- Check if Laravel Sanctum is properly configured
- Verify API token in browser developer tools

### Port Already in Use
If port 8000 or 5173 is in use:
```bash
# For Laravel, use a different port:
php artisan serve --port=8001

# For Vite, edit vite.config.ts:
server: { port: 5174 }
```

## Security Considerations

- Change default passwords in production
- Update `APP_KEY` in `.env`
- Use HTTPS in production
- Enable rate limiting on API endpoints
- Implement proper backup strategy for database
- Review and update CORS settings for production domains

## Future Enhancements

- [ ] Export functionality (PDF/Excel)
- [ ] Advanced filtering and sorting
- [ ] Email notifications for status changes
- [ ] File attachments for jobs
- [ ] Activity logs and audit trails
- [ ] Dashboard analytics and charts
- [ ] Barcode/QR code scanning for items
- [ ] Multi-language support

## Support

For issues and questions:
1. Check this README first
2. Review error messages in browser console and Laravel logs
3. Check Laravel logs at `backend/storage/logs/laravel.log`

## License

This project is proprietary software for internal use.

---

**Built with ❤️ using React, Laravel, and Filament PHP**
