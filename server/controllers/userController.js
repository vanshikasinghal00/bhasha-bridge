const User = require('../models/User');

// @desc    Update user preferences
// @route   PUT /api/user/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { defaultSourceLang, defaultTargetLang, theme } = req.body;

    const updates = {};
    if (defaultSourceLang) updates.defaultSourceLang = defaultSourceLang;
    if (defaultTargetLang) updates.defaultTargetLang = defaultTargetLang;
    if (theme) updates.theme = theme;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Preferences updated successfully!',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences.' });
  }
};

// @desc    Get user profile
// @route   GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
};
