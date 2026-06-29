const express = require('express');
const multer = require('multer');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  upsertProfile,
  deleteProfile,
  uploadCv,
} = require('../controllers/profileController');
const { PDF, DOCX } = require('../services/cvParser');

// CV upload: keep the file in memory (we extract text and discard it), 5MB cap, PDF/DOCX only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === PDF || file.mimetype === DOCX) cb(null, true);
    else cb(Object.assign(new Error('Only PDF or DOCX files are allowed'), { status: 400 }));
  },
});

// All profile routes require authentication
router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', upsertProfile);
router.delete('/', deleteProfile);
router.post('/upload-cv', upload.single('cv'), uploadCv);

module.exports = router;
