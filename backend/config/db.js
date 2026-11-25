const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_mart';
    const conn = await mongoose.connect(mongoURI);

    console.log(`[MongoDB Connected] Host: ${conn.connection.host} | DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    console.error('Make sure MongoDB is running locally (e.g. via Windows Service) or check MONGO_URI in .env');
    // We do not exit process immediately so server can still report DB status to client
  }
};

module.exports = connectDB;
