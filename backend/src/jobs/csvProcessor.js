const { parse } = require('csv-parse');
const { pool } = require('../config/db');

const jobs = new Map();

function getJob(jobId) {
  return jobs.get(jobId);
}

function createJob(jobId, total) {
  const job = { id: jobId, status: 'processing', total, processed: 0, failed: 0, errors: [] };
  jobs.set(jobId, job);
  return job;
}

async function saveJobToDB(job) {
  await pool.query(
    `INSERT INTO jobs (id, status, total, processed, failed, errors)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO UPDATE SET status=$2, processed=$4, failed=$5, errors=$6`,
    [job.id, job.status, job.total, job.processed, job.failed, JSON.stringify(job.errors)]
  );
}

async function processRow(row, rowIndex, job, retries = 2) {
  const { ngo_id, month, people_helped, events_conducted, funds_utilized, region } = row;

  if (!ngo_id || !month || !people_helped || !events_conducted || !funds_utilized) {
    job.failed++;
    job.errors.push({ row: rowIndex, reason: 'Missing required fields' });
    return;
  }

  const peopleNum = parseInt(people_helped);
  const eventsNum = parseInt(events_conducted);
  const fundsNum = parseFloat(funds_utilized);

  if (isNaN(peopleNum) || isNaN(eventsNum) || isNaN(fundsNum)) {
    job.failed++;
    job.errors.push({ row: rowIndex, reason: 'Invalid numeric values' });
    return;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await pool.query(
        `INSERT INTO reports (ngo_id, month, people_helped, events_conducted, funds_utilized, region)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (ngo_id, month) DO NOTHING`,
        [ngo_id.trim(), month.trim(), peopleNum, eventsNum, fundsNum, region ? region.trim() : null]
      );
      job.processed++;
      return;
    } catch (err) {
      if (attempt === retries) {
        job.failed++;
        job.errors.push({ row: rowIndex, reason: err.message });
      }
    }
  }
}

async function processCSV(jobId, fileBuffer) {
  const rows = await new Promise((resolve, reject) => {
    parse(fileBuffer, { columns: true, skip_empty_lines: true, trim: true }, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });

  const job = createJob(jobId, rows.length);
  await saveJobToDB(job);

  setImmediate(async () => {
    for (let i = 0; i < rows.length; i++) {
      await processRow(rows[i], i + 1, job);
      if (i % 5 === 0) await saveJobToDB(job);
    }
    job.status = 'done';
    await saveJobToDB(job);
  });
}

module.exports = { processCSV, getJob };
