const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Translation = require('../models/Translation');

// @desc    Add a translation to favorites
// @route   POST /api/favorites
exports.addFavorite = async (req, res) => {
  try {
    const { translationId, note } = req.body;

    if (!translationId) {
      return res.status(400).json({ message: 'Translation ID is required.' });
    }

    // Validate the translationId is a proper MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(translationId)) {
      return res.status(400).json({ message: 'Invalid translation ID format.' });
    }

    // Verify translation exists and belongs to user
    const translation = await Translation.findOne({
      _id: translationId,
      userId: req.user._id
    });

    if (!translation) {
      return res.status(404).json({ message: 'Translation not found.' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: req.user._id,
      translationId
    });

    if (existing) {
      return res.status(400).json({ message: 'This translation is already in your favorites.' });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      translationId,
      note: note || ''
    });

    const populated = await Favorite.findById(favorite._id).populate('translationId');

    res.status(201).json({
      message: 'Added to favorites!',
      favorite: populated
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Failed to add favorite.' });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
exports.getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [favorites, total] = await Promise.all([
      Favorite.find({ userId: req.user._id })
        .populate('translationId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Favorite.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      favorites,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Failed to fetch favorites.' });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:id
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    res.json({ message: 'Removed from favorites.' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Failed to remove favorite.' });
  }
};

// @desc    Check if a translation is favorited
// @route   GET /api/favorites/check/:translationId
exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      translationId: req.params.translationId
    });

    res.json({ isFavorited: !!favorite, favoriteId: favorite ? favorite._id : null });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ message: 'Failed to check favorite status.' });
  }
};
