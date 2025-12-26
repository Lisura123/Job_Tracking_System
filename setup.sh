#!/bin/bash

echo "================================================"
echo "Job Tracking System - Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo "Step 1: Checking prerequisites..."
echo "-----------------------------------"

# Check for PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1)
    echo -e "${GREEN}✓${NC} PHP found: $PHP_VERSION"
else
    echo -e "${RED}✗${NC} PHP not found. Please install PHP 8.2 or higher"
    exit 1
fi

# Check for Composer
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | head -n 1)
    echo -e "${GREEN}✓${NC} Composer found: $COMPOSER_VERSION"
else
    echo -e "${YELLOW}!${NC} Composer not found. Installing Composer..."
    cd backend
    php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    php composer-setup.php
    php -r "unlink('composer-setup.php');"
    alias composer='php composer.phar'
    cd ..
    echo -e "${GREEN}✓${NC} Composer installed locally"
fi

# Check for Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js found: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 16 or higher"
    exit 1
fi

# Check for npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm found: v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found. Please install npm"
    exit 1
fi

echo ""
echo "Step 2: Setting up Backend (Laravel)..."
echo "-----------------------------------"

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} .env file created"
else
    echo -e "${YELLOW}!${NC} .env file already exists, skipping..."
fi

# Install Composer dependencies
echo "Installing PHP dependencies..."
if [ -f "composer.phar" ]; then
    php composer.phar install --no-interaction
else
    composer install --no-interaction
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} PHP dependencies installed"
else
    echo -e "${RED}✗${NC} Failed to install PHP dependencies"
    exit 1
fi

# Generate application key
echo "Generating application key..."
php artisan key:generate --force
echo -e "${GREEN}✓${NC} Application key generated"

echo ""
echo -e "${YELLOW}IMPORTANT: Database Configuration${NC}"
echo "-----------------------------------"
echo "Before proceeding, please:"
echo "1. Start XAMPP and ensure MySQL is running"
echo "2. Create a database named 'job_tracking_system'"
echo "3. Update backend/.env with your database credentials:"
echo "   DB_DATABASE=job_tracking_system"
echo "   DB_USERNAME=root"
echo "   DB_PASSWORD="
echo ""
read -p "Press Enter when database is configured and ready..."

# Run migrations
echo "Running database migrations..."
php artisan migrate --force

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Database migrations completed"
else
    echo -e "${RED}✗${NC} Migration failed. Please check your database configuration"
    exit 1
fi

# Seed database
echo "Seeding database with sample data..."
php artisan db:seed --force
echo -e "${GREEN}✓${NC} Database seeded"

cd ..

echo ""
echo "Step 3: Setting up Frontend (React)..."
echo "-----------------------------------"

# Install npm dependencies
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Node.js dependencies installed"
else
    echo -e "${RED}✗${NC} Failed to install Node.js dependencies"
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && php artisan serve"
echo "   Backend will run on: http://localhost:8000"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo "   Frontend will run on: http://localhost:5173"
echo ""
echo "3. Login credentials:"
echo "   Admin: admin@jobtracking.com / password"
echo "   User:  user@jobtracking.com / password"
echo ""
echo "4. Filament Admin Panel:"
echo "   Access at: http://localhost:8000/admin"
echo "   Create admin user: cd backend && php artisan make:filament-user"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
