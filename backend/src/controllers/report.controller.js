const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { processCSV, getJob } = require('../jobs/csvProcessor');

async function submitReport(req, res) {
  const { ngo_id, month, people_helped, events_conducted, funds_utilized, region } = req.body;

  if (!ngo_id || !month || !people_helped || !events_conducted || !funds_utilized) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!monthRegex.test(month)) {
    return res.status(400).json({ message: 'Month must be in YYYY-MM format' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reports (ngo_id, month, people_helped, events_conducted, funds_utilized, region)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (ngo_id, month) DO NOTHING
       RETURNING *`,
      [ngo_id, month, parseInt(people_helped), parseInt(events_conducted), parseFloat(funds_utilized), region || null]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ message: 'Report for this NGO and month already exists' });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function uploadCSV(req, res) {
  if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

  const jobId = uuidv4();
  processCSV(jobId, req.file.buffer).catch(console.error);

  res.status(202).json({ job_id: jobId });
}

async function getJobStatus(req, res) {
  const { job_id } = req.params;

  const inMemory = getJob(job_id);
  if (inMemory) return res.json(inMemory);

  try {
    const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [job_id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Job not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getDashboard(req, res) {
  const { month, region, ngo_id } = req.query;
  if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM)' });

  try {
    const conditions = ['month = $1'];
    const params = [month];

    if (region) {
      params.push(region);
      conditions.push(`region = $${params.length}`);
    }
    if (ngo_id) {
      params.push(ngo_id);
      conditions.push(`ngo_id ILIKE $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const result = await pool.query(
      `SELECT
        COUNT(DISTINCT ngo_id) AS total_ngos,
        COALESCE(SUM(people_helped), 0) AS total_people_helped,
        COALESCE(SUM(events_conducted), 0) AS total_events,
        COALESCE(SUM(funds_utilized), 0) AS total_funds
       FROM reports WHERE ${where}`,
      params
    );

    const regions = await pool.query(`SELECT DISTINCT region FROM reports WHERE region IS NOT NULL ORDER BY region`);

    res.json({ ...result.rows[0], available_regions: regions.rows.map(r => r.region) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

function adminLogin(req, res) {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
}

module.exports = { submitReport, uploadCSV, getJobStatus, getDashboard, adminLogin };
