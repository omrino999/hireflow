const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// All job routes require authentication
router.use(authMiddleware);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;
