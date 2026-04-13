const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

async function connectDB() {
  if (!uri) {
    throw new Error('MONGO_URI is not set in environment');
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  return mongoose.connection;
}

module.exports = { connectDB };
