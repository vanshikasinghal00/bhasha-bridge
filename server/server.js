const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const translateRoutes = require('./routes/translate');
const historyRoutes = require('./routes/history');
const favoritesRoutes = require('./routes/favorites');
const userRoutes = require('./routes/user');

const app = express();

// Middleware - MUST be first
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin
      || origin.includes('vercel.app')
      || origin.includes('localhost')
      || origin.includes('127.0.0.1')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Database Health Check Middleware
const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database not connected. Please ensure MONGO_URI is set correctly in Vercel Environment Variables.',
      tip: 'Check your Vercel project settings > Environment Variables'
    });
  }
  next();
};

// Explicitly handle pre-flight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    bufferCommands: false, // Stop mongoose from holding requests while disconnected
  })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection failed:', err.message));
} else {
  console.log('⚠️ MONGO_URI not found in environment variables. Database features will fail.');
}

// Only listen if running locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

module.exports = app;
