const Translation = require('../models/Translation');
const Favorite = require('../models/Favorite');

// @desc    Get user's translation history
// @route   GET /api/history
exports.getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, sourceLang, targetLang, search } = req.query;

    const query = { userId: req.user._id };

    // Filter by source language
    if (sourceLang) {
      query.sourceLang = sourceLang;
    }

    // Filter by target language
    if (targetLang) {
      query.targetLang = targetLang;
    }

    // Search in source or translated text
    if (search) {
      query.$or = [
        { sourceText: { $regex: search, $options: 'i' } },
        { translatedText: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [translations, total] = await Promise.all([
      Translation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Translation.countDocuments(query)
    ]);

    res.json({
      translations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

// @desc    Get language usage stats
// @route   GET /api/history/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [sourceLangStats, targetLangStats, totalCount, totalFavorites, typeStats] = await Promise.all([
      Translation.aggregate([
        { $match: { userId } },
        { $group: { _id: '$sourceLang', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Translation.aggregate([
        { $match: { userId } },
        { $group: { _id: '$targetLang', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Translation.countDocuments({ userId }),
      Favorite.countDocuments({ userId }),
      Translation.aggregate([
        { $match: { userId } },
        { $group: { _id: '$translationType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      totalTranslations: totalCount,
      totalFavorites,
      sourceLangStats,
      targetLangStats,
      typeStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};

// @desc    Delete a translation from history
// @route   DELETE /api/history/:id
exports.deleteHistoryItem = async (req, res) => {
  try {
    const translation = await Translation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!translation) {
      return res.status(404).json({ message: 'Translation not found.' });
    }

    res.json({ message: 'Translation deleted successfully.' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ message: 'Failed to delete translation.' });
  }
};
