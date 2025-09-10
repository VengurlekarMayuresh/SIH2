const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Institution = require('./models/Institution');
require('dotenv').config();

const testPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const inst = await Institution.findOne({ institutionId: 'TEST001' });
        if (!inst) {
            console.log('❌ TEST001 institution not found');
            return;
        }
        
        console.log('Institution found:', inst.name, '-', inst.email);
        console.log('Testing passwords...\n');
        
        const testPasswords = ['testpass123', 'Test@123', 'test123', 'password', 'Test123!', 'Admin123'];
        
        for (const pwd of testPasswords) {
            const match = await bcrypt.compare(pwd, inst.password);
            console.log(`Password '${pwd}':`, match ? '✅ MATCHES' : '❌ No match');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

testPasswords();
