const express = require('express');
const router = express.Router();

// CRUD for job applications - coming in Day 3
router.get('/', (req, res) => res.json({ message: 'jobs endpoint - coming soon' }));

module.exports = router;
