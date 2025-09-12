require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Institution = require('./models/Institution');
const Alert = require('./models/Alert');

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected:', conn.connection.host);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

const debugDatabase = async () => {
    await connectDb();
    
    console.log('\n=== DEBUGGING DATABASE ===\n');
    
    // Check institutions
    console.log('1. Checking Institutions:');
    const institutions = await Institution.find({});
    institutions.forEach(inst => {
        console.log(`   - ${inst.name} (ID: ${inst.institutionId}, ObjectId: ${inst._id})`);
    });
    
    // Check students
    console.log('\n2. Checking Students:');
    const students = await Student.find({}).populate('institutionId', 'name institutionId');
    students.forEach(student => {
        console.log(`   - ${student.name} (Email: ${student.email})`);
        console.log(`     Institution: ${student.institutionId ? student.institutionId.name : 'Independent'}`);
        console.log(`     Institution ObjectId: ${student.institutionId ? student.institutionId._id : 'N/A'}`);
        console.log(`     Class: ${student.class || 'N/A'}, Division: ${student.division || 'N/A'}`);
    });
    
    // Check alerts
    console.log('\n3. Checking Alerts:');
    const alerts = await Alert.find({}).populate('createdBy', 'name institutionId');
    alerts.forEach(alert => {
        console.log(`   - ${alert.title} (Type: ${alert.type}, Active: ${alert.isActive})`);
        console.log(`     Institution ObjectId: ${alert.institutionId}`);
        console.log(`     Created by: ${alert.createdBy ? alert.createdBy.name : 'Unknown'}`);
    });
    
    // Test the getActiveAlerts method
    console.log('\n4. Testing getActiveAlerts method:');
    for (const inst of institutions) {
        console.log(`   Testing for institution: ${inst.name} (ObjectId: ${inst._id})`);
        try {
            const activeAlerts = await Alert.getActiveAlerts(inst._id, 'students');
            console.log(`   Found ${activeAlerts.length} active alerts`);
            activeAlerts.forEach(alert => {
                console.log(`     - ${alert.title} (${alert.type})`);
            });
        } catch (error) {
            console.error(`   Error fetching alerts: ${error.message}`);
        }
    }
    
    process.exit(0);
};

debugDatabase().catch(console.error);