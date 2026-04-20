const router = require('express').Router();
const multer = require('multer');
const adminAuth = require('../middleware/adminAuth');
const {
  submitReport,
  uploadCSV,
  getJobStatus,
  getDashboard,
  adminLogin,
} = require('../controllers/report.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/auth/admin', adminLogin);
router.post('/report', submitReport);
router.post('/reports/upload', upload.single('file'), uploadCSV);
router.get('/job-status/:job_id', getJobStatus);
router.get('/dashboard', adminAuth, getDashboard);

module.exports = router;
