const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sourceText: {
    type: String,
    required: [true, 'Source text is required'],
    maxlength: 5000
  },
  translatedText: {
    type: String,
    required: [true, 'Translated text is required'],
    maxlength: 10000
  },
  sourceLang: {
    type: String,
    required: true,
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'kn', 'ml', 'or', 'ur']
  },
  targetLang: {
    type: String,
    required: true,
    enum: ['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'pa', 'kn', 'ml', 'or', 'ur']
  },
  translationType: {
    type: String,
    default: 'text',
    enum: ['text', 'speech', 'ocr']
  }
}, {
  timestamps: true
});

// Index for efficient querying
translationSchema.index({ userId: 1, createdAt: -1 });
translationSchema.index({ userId: 1, sourceLang: 1 });
translationSchema.index({ userId: 1, targetLang: 1 });

module.exports = mongoose.model('Translation', translationSchema);
