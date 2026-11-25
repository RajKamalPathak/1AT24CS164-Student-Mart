const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_mart';

    const isCloudDB =
      mongoURI.includes('mongodb+srv://') ||
      mongoURI.includes('aivencloud.com') ||
      mongoURI.includes('ssl=true') ||
      mongoURI.includes('tls=true');

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 12000,
    });

    console.log(
      `[MongoDB Connected] Mode: ${isCloudDB ? 'Cloud (Aiven / Atlas)' : 'Local'} | Host: ${conn.connection.host} | DB: ${conn.connection.name}`
    );
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error(
      'Check that local MongoDB is running or verify your Aiven MONGO_URI in environment variables.'
    );
    return null;
  }
};

module.exports = connectDB;
