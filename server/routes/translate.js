const express = require('express');
const router = express.Router();
const { translate, getLanguages, transliterate, textToSpeech } = require('../controllers/translateController');
const authMiddleware = require('../middleware/authMiddleware');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return process.env.JWT_SECRET;
};

// Optional auth — translation works without login but saves to history if logged in
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.userId).select('-password');
      if (user) req.user = user;
    }
  } catch (err) {
    // Silent fail — user just won't have history saved
  }
  next();
};

router.post('/', optionalAuth, translate);
router.post('/transliterate', transliterate);
router.get('/tts', textToSpeech);
router.get('/languages', getLanguages);

module.exports = router;
