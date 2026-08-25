const mongoose = require("mongoose");

let cached = global.__bhashaBridgeMongoose;

if (!cached) {
  cached = global.__bhashaBridgeMongoose = {
    conn: null,
    promise: null,
  };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is not configured");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).catch((error) => {
      cached.promise = null;
      cached.conn = null;
      throw error;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDbConnected };
