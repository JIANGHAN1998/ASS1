#!/bin/bash

# Swimmate Dashboard Setup Script
# This script sets up the project with Azure MySQL credentials

echo "🏊‍♀️ Setting up Swimmate Dashboard..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file with Azure MySQL credentials
echo ""
echo "🔧 Setting up database configuration..."

cat > .env << EOF
# Database Configuration
# Azure MySQL Flexible Server Configuration

# MySQL Database Host (Azure MySQL server hostname)
DB_HOST=swimmate-sql.mysql.database.azure.com

# Database Username
DB_USER=yjin0076

# Database Password
DB_PASSWORD=34688455YitingJin

# Database Port (default: 3306)
DB_PORT=3306

# Enable SSL for Azure MySQL (recommended: true)
DB_SSL=true

# Server Port (default: 3000)
PORT=3000

# CORS Origins (comma-separated, leave empty to allow all)
ALLOWED_ORIGINS=
EOF

echo "✅ Database configuration created"

# Test database connection
echo ""
echo "🔍 Testing database connection..."
echo "   Starting server temporarily..."

# Start server in background
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test connection
RESPONSE=$(curl -s http://localhost:3000/api/ping 2>/dev/null)

# Stop the test server
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

if [[ "$RESPONSE" == *'"ok":true'* ]]; then
    echo "✅ Database connection successful!"
else
    echo "⚠️  Database connection failed, but setup is complete"
    echo "   You may need to check your Azure MySQL server settings"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================================="
echo ""
echo "To start the dashboard:"
echo "  npm start"
echo ""
echo "Then visit: http://localhost:3000/swimmate-dashboard.html"
echo ""
echo "Happy swimming! 🏊‍♀️🏖️"
