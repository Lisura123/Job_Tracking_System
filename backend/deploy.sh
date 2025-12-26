#!/bin/bash

# Job Tracking System Deployment Script for Hostinger
# Run this script after pushing to GitHub to deploy updates

echo "🚀 Starting deployment..."

# Pull latest changes from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Install/Update Composer dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Run database migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force

# Clear and cache configurations
echo "🧹 Clearing old cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo "💾 Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize application
echo "⚡ Optimizing application..."
php artisan optimize

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is now live at: https://jobs.cameralksrore.com"
