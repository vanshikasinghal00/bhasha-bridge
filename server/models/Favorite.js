const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  translationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Translation',
    required: true
  },
  note: {
    type: String,
    default: '',
    maxlength: 500
  }
}, {
  timestamps: true
});

// Prevent duplicate favorites
favoriteSchema.index({ userId: 1, translationId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
