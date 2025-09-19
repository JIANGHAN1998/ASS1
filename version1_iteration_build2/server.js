import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    return allowedOrigins.length === 0 || allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error('Not allowed by CORS'));
  }
}));

app.use(express.static('public'));

function getBaseConfig() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  };
  if ((process.env.DB_SSL || 'true').toLowerCase() === 'true') {
    config.ssl = { minVersion: 'TLSv1.2', rejectUnauthorized: true };
  }
  return config;
}

function assertIdentifier(id, name) {
  if (!id || !/^[A-Za-z0-9_]+$/.test(id)) {
    const label = name ? `${name} ` : '';
    throw new Error(`Invalid ${label}identifier`);
  }
}

app.get('/api/ping', async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection(getBaseConfig());
    const [rows] = await conn.query('SELECT 1 AS ok');
    res.json({ ok: rows[0]?.ok === 1 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Ping failed', detail: e.message });
  } finally {
    if (conn) await conn.end();
  }
});

// Beach-specific endpoints for the swimmate dashboard
app.get('/api/beaches', async (req, res) => {
  let conn;
  try {
    conn = await mysql.createConnection({ ...getBaseConfig(), database: 'swim' });
    const [rows] = await conn.query(
      'SELECT site_id, site_name, water_body FROM site ORDER BY site_name ASC'
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list beaches', detail: e.message });
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/api/beach-data', async (req, res) => {
  const { beachId, year } = req.query;
  try {
    if (!beachId || !/^\d+$/.test(beachId)) {
      return res.status(400).json({ error: 'Invalid beach ID' });
    }
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  let conn;
  try {
    conn = await mysql.createConnection({ ...getBaseConfig(), database: 'swim' });
    
    // Get beach name
    const [beachRows] = await conn.query(
      'SELECT site_name FROM site WHERE site_id = ?',
      [beachId]
    );
    
    if (beachRows.length === 0) {
      return res.status(404).json({ error: 'Beach not found' });
    }
    
    const beachName = beachRows[0].site_name;
    
    // Build query with optional year filter
    let sql = `
      SELECT 
        enterococci_date,
        enterococci_quality_level,
        enterococci_value,
        enterococci_sample_type,
        YEAR(STR_TO_DATE(enterococci_date, '%Y/%m/%d')) as year,
        MONTH(STR_TO_DATE(enterococci_date, '%Y/%m/%d')) as month
      FROM enterococci 
      WHERE enterococci_site_id = ?
    `;
    const params = [beachId];
    
    if (year && /^\d{4}$/.test(year)) {
      sql += ' AND YEAR(STR_TO_DATE(enterococci_date, \'%Y/%m/%d\')) = ?';
      params.push(year);
    }
    
    sql += ' ORDER BY STR_TO_DATE(enterococci_date, \'%Y/%m/%d\') ASC';
    
    const [dataRows] = await conn.query(sql, params);
    
    // Calculate statistics
    const totalTests = dataRows.length;
    const qualityCounts = {};
    const monthlyData = {};
    let totalRating = 0;
    
    dataRows.forEach(row => {
      const quality = row.enterococci_quality_level;
      qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
      
      // Rating system: Safe=4, Relatively Safe=3, Caution=2, Unsafe=1
      const ratingMap = { 'Safe': 4, 'Relatively Safe': 3, 'Caution': 2, 'Unsafe': 1 };
      totalRating += ratingMap[quality] || 0;
      
      // Monthly aggregation
      const monthKey = `${row.year}-${String(row.month).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, good: 0, fair: 0, poor: 0 };
      }
      monthlyData[monthKey].total++;
      
      if (quality === 'Safe') monthlyData[monthKey].good++;
      else if (quality === 'Relatively Safe') monthlyData[monthKey].fair++;
      else monthlyData[monthKey].poor++;
    });
    
    const averageRating = totalTests > 0 ? (totalRating / totalTests).toFixed(2) : 0;
    
    // Convert monthly data to array
    const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      goodPercent: ((data.good / data.total) * 100).toFixed(1),
      fairPercent: ((data.fair / data.total) * 100).toFixed(1),
      poorPercent: ((data.poor / data.total) * 100).toFixed(1)
    }));
    
    res.json({
      beachName,
      totalTests,
      averageRating,
      qualityCounts,
      monthlyData: monthlyArray,
      rawData: dataRows
    });
    
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get beach data', detail: e.message });
  } finally {
    if (conn) await conn.end();
  }
});

app.get('/api/beach-comparison', async (req, res) => {
  const { beachIds } = req.query;
  if (!beachIds) {
    return res.status(400).json({ error: 'Beach IDs required' });
  }
  
  const ids = beachIds.split(',').filter(id => /^\d+$/.test(id.trim())).slice(0, 3);
  if (ids.length === 0) {
    return res.status(400).json({ error: 'Valid beach IDs required' });
  }
  
  let conn;
  try {
    conn = await mysql.createConnection({ ...getBaseConfig(), database: 'swim' });
    
    const results = [];
    
    for (const beachId of ids) {
      // Get beach name
      const [beachRows] = await conn.query(
        'SELECT site_name FROM site WHERE site_id = ?',
        [beachId]
      );
      
      if (beachRows.length === 0) continue;
      
      const beachName = beachRows[0].site_name;
      
      // Get yearly data
      const [dataRows] = await conn.query(`
        SELECT 
          YEAR(STR_TO_DATE(enterococci_date, '%Y/%m/%d')) as year,
          enterococci_quality_level,
          COUNT(*) as count
        FROM enterococci 
        WHERE enterococci_site_id = ?
        GROUP BY year, enterococci_quality_level
        ORDER BY year ASC
      `, [beachId]);
      
      // Process into yearly percentages
      const yearlyStats = {};
      dataRows.forEach(row => {
        if (!yearlyStats[row.year]) {
          yearlyStats[row.year] = { total: 0, good: 0, fair: 0 };
        }
        yearlyStats[row.year].total += row.count;
        if (row.enterococci_quality_level === 'Safe') {
          yearlyStats[row.year].good += row.count;
        } else if (row.enterococci_quality_level === 'Relatively Safe') {
          yearlyStats[row.year].fair += row.count;
        }
      });
      
      const yearlyArray = Object.entries(yearlyStats).map(([year, stats]) => ({
        year: parseInt(year),
        goodPercent: ((stats.good / stats.total) * 100).toFixed(1),
        fairPercent: ((stats.fair / stats.total) * 100).toFixed(1),
        rating: (((stats.good * 4) + (stats.fair * 3)) / stats.total).toFixed(2)
      }));
      
      results.push({
        beachId,
        beachName,
        yearlyData: yearlyArray
      });
    }
    
    res.json(results);
    
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get comparison data', detail: e.message });
  } finally {
    if (conn) await conn.end();
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Swimmate Dashboard running on http://localhost:${port}`);
  console.log(`Visit http://localhost:${port}/swimmate-dashboard.html to access the dashboard`);
});

