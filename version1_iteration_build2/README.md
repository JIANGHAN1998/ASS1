# Swimmate Dashboard

Port Phillip Bay Water Quality Analysis Dashboard - A beautiful, interactive web application for analyzing beach water quality data.

![Swimmate Dashboard](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen)

## 🚀 For Teammates - Super Quick Start

**Just run this one command:**
```bash
./run.sh
```

That's it! This will automatically:
- ✅ Set up everything you need
- ✅ Connect to the Azure MySQL database  
- ✅ Start the dashboard
- ✅ Open it at http://localhost:3000/swimmate-dashboard.html

**Alternative setup:**
```bash
./setup.sh  # Setup only
npm start   # Then start manually
```

## Features

🏊‍♀️ **Beach Analysis** - Detailed water quality analysis for individual beaches  
📊 **Interactive Charts** - D3.js powered visualizations with monthly trends  
🏆 **Beach Comparison** - Compare up to 3 beaches side-by-side  
📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile  
🎯 **Smart Recommendations** - AI-powered swimming safety recommendations  

## Quick Start

### 🚀 Super Simple Setup (Recommended)

**For teammates - just run this one command:**

```bash
# On Mac/Linux
./setup.sh

# On Windows
setup.bat
```

That's it! The script will:
- ✅ Install all dependencies
- ✅ Configure the Azure MySQL database connection
- ✅ Test the connection
- ✅ Get you ready to go!

Then start the server:
```bash
npm start
```

Visit: **http://localhost:3000/swimmate-dashboard.html**

---

### 🛠️ Manual Setup (Alternative)

If you prefer to set up manually:

#### 1. Prerequisites
- Node.js 18+ installed

#### 2. Installation
```bash
# Install dependencies
npm install
```

#### 3. Database Configuration
```bash
# Copy the environment template
cp env.example .env
```

Fill in the `.env` file with these Azure MySQL credentials:
```env
DB_HOST=swimmate-sql.mysql.database.azure.com
DB_USER=yjin0076
DB_PASSWORD=34688455YitingJin
DB_PORT=3306
DB_SSL=true
PORT=3000
ALLOWED_ORIGINS=
```

#### 4. Run the Application
```bash
npm start
```

The dashboard will be available at: **http://localhost:3000/swimmate-dashboard.html**

## Database Schema

The application expects the following database structure in the `swim` database:

### `site` table
```sql
- site_id (INT) - Unique identifier for each beach
- site_name (VARCHAR) - Beach name
- water_body (VARCHAR) - Water body name
```

### `enterococci` table
```sql
- enterococci_site_id (INT) - Foreign key to site.site_id
- enterococci_date (VARCHAR) - Date in 'YYYY/MM/DD' format
- enterococci_quality_level (VARCHAR) - 'Safe', 'Relatively Safe', 'Caution', 'Unsafe'
- enterococci_value (DECIMAL) - Numerical reading
- enterococci_sample_type (VARCHAR) - Sample type
```

## API Endpoints

The server provides these REST endpoints:

- `GET /api/ping` - Health check
- `GET /api/beaches` - List all beaches
- `GET /api/beach-data?beachId=X&year=Y` - Get detailed data for a beach
- `GET /api/beach-comparison?beachIds=X,Y,Z` - Compare multiple beaches

## Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Connection Issues
- Verify your Azure MySQL server allows connections from your IP
- Check that SSL is properly configured
- Ensure the `swim` database exists with proper tables

### No Data Showing
- Verify the database contains data in the expected format
- Check browser console for API errors
- Test the `/api/ping` endpoint directly

### Performance
- The app is optimized for datasets with thousands of records
- Large datasets are automatically paginated
- Charts are limited to reasonable data ranges for performance

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (Azure MySQL compatible)
- **Frontend**: Vanilla JavaScript, D3.js
- **Styling**: Pure CSS with modern design
- **Charts**: D3.js v7

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify database connectivity with `/api/ping`
3. Ensure your data matches the expected schema
4. Check server logs for detailed error messages

---

**Ready to explore Melbourne's beaches!** 🏖️

