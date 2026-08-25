const express = require('express');
const router = express.Router();
const { getHistory, getStats, deleteHistoryItem } = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getHistory);
router.get('/stats', getStats);
router.delete('/:id', deleteHistoryItem);

module.exports = router;
