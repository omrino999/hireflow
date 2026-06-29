const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  upsertProfile,
  deleteProfile,
} = require('../controllers/profileController');

// All profile routes require authentication
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', upsertProfile);
router.delete('/', deleteProfile);

module.exports = router;
