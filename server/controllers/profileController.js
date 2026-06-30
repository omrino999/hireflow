const { Profile } = require('../models');
const { extractText } = require('../services/cvParser');

// Only these fields can be set from the request body.
// AI-generated fields (generatedCv, careerPaths) are written by the AI layer, not the client.
const ALLOWED_FIELDS = ['rawDescription', 'cvText'];

const pickAllowed = (body) => {
  const data = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  return data;
};

// GET /api/profile — the logged-in user's profile (null if none yet)
const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    res.json(profile); // null is a valid response — frontend treats it as "no profile yet"
  } catch (err) {
    next(err);
  }
};

// PUT /api/profile — create or update the user's profile (upsert)
const upsertProfile = async (req, res, next) => {
  try {
    const data = pickAllowed(req.body);
    let profile = await Profile.findOne({ where: { userId: req.user.id } });

    if (profile) {
      await profile.update(data);
    } else {
      profile = await Profile.create({ ...data, userId: req.user.id });
    }
    res.json(profile);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /api/profile — remove the user's profile data (privacy control)
const deleteProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'No profile to delete' });

    await profile.destroy();
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/profile/upload-cv — extract text from an uploaded PDF/DOCX into cvText
const uploadCv = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let text;
    try {
      text = await extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    text = (text || '').trim();
    // Very little text usually means an image-based/scanned or heavily-designed PDF
    // whose text layer didn't extract — tell the user instead of saving garbage.
    if (text.length < 80) {
      return res.status(422).json({
        error:
          'We could only read a little text from this file — it may be image-based or heavily designed. ' +
          'Try a text-based PDF/DOCX, or paste your CV text manually.',
      });
    }

    let profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (profile) {
      await profile.update({ cvText: text });
    } else {
      profile = await Profile.create({ userId: req.user.id, cvText: text });
    }
    res.json({ cvText: profile.cvText, length: text.length });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    next(err);
  }
};

// DELETE /api/profile/generated-cv — clear the AI-generated CV (server-controlled,
// so it bypasses the client write-protection on AI fields)
const clearGeneratedCv = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'No profile' });
    await profile.update({ generatedCv: null });
    res.json({ message: 'Generated CV removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, upsertProfile, deleteProfile, uploadCv, clearGeneratedCv };
