#!/bin/bash

# Frontend Build and Deploy Script
echo "🏗️  Building frontend for production..."

# Install dependencies
npm install

# Build for production
npm run build

echo "✅ Frontend build completed!"
echo "📦 Build files are in the 'dist' directory"
echo "📝 Upload the contents of 'dist' folder to your Hostinger public_html directory"
