const express = require('express');
const router = express.Router();
const { updatePreferences, getProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/preferences', updatePreferences);

module.exports = router;
