const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safed').then(async () => {
  console.log('Connected to MongoDB');
  
  const Module = require('./models/Module');
  const modules = await Module.find().select('_id title');
  
  console.log('Available modules:');
  modules.forEach(m => console.log(`ID: ${m._id}, Title: ${m.title}`));
  
  mongoose.disconnect();
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});