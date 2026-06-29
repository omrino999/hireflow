const { Profile } = require('../models');

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

module.exports = { getProfile, upsertProfile, deleteProfile };
