const express = require('express');
const router = express.Router();
const { addFavorite, getFavorites, removeFavorite, checkFavorite } = require('../controllers/favoritesController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', addFavorite);
router.get('/', getFavorites);
router.delete('/:id', removeFavorite);
router.get('/check/:translationId', checkFavorite);

module.exports = router;
