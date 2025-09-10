const mongoose = require('mongoose');

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected: " + mongoose.connection.host);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
