#!/bin/bash

# One-liner to setup and run Swimmate Dashboard
# Usage: ./run.sh

echo "🏊‍♀️ Swimmate Dashboard - One-Click Run"
echo "======================================"

# Run setup if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 First time setup..."
    ./setup.sh
    echo ""
fi

echo "🚀 Starting Swimmate Dashboard..."
echo "   Visit: http://localhost:3000/swimmate-dashboard.html"
echo "   Press Ctrl+C to stop"
echo ""

npm start
