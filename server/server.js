const express = require('express');
const cors = require('cors');
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
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicitly handle pre-flight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
// Ensure MongoDB is connected before API handlers run.
// This prevents Mongoose queries from executing during serverless cold starts.
const { connectDB } = require("./config/db");
app.use(async (req, res, next) => {
  if (req.path === "/api/health") return next();
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    res.status(503).json({
      error: "Database unavailable",
      message: "The database connection could not be established.",
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/user', userRoutes);

app.get("/api/health", async (req, res) => {
  try {
    const { connectDB, isDbConnected } = require("./config/db");
    await connectDB();
    res.status(200).json({
      status: "ok",
      database: isDbConnected() ? "connected" : "disconnected",
    });
  } catch (error) {
    console.error("Health check database error:", error.message);
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Only listen if running locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

module.exports = app;
