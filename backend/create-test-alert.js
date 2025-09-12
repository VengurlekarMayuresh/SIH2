require('dotenv').config();
const mongoose = require('mongoose');
const Alert = require('./models/Alert');
const Institution = require('./models/Institution');

const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected:', conn.connection.host);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

const createTestAlert = async () => {
    await connectDb();
    
    console.log('\n=== CREATING TEST ALERT ===\n');
    
    // Get the first institution
    const institution = await Institution.findOne({});
    if (!institution) {
        console.log('❌ No institutions found in database');
        process.exit(1);
    }
    
    console.log(`Using institution: ${institution.name} (ObjectId: ${institution._id})`);
    
    // Create a test alert
    const testAlert = new Alert({
        title: "Emergency Drill Alert",
        message: "Attention all students! There will be a fire safety drill tomorrow at 10:00 AM. Please follow your teachers' instructions and evacuate calmly when the alarm sounds.",
        type: "warning",
        priority: "high",
        institutionId: institution._id,
        createdBy: institution._id,
        targetAudience: "students",
        isActive: true
    });
    
    try {
        await testAlert.save();
        console.log(`✅ Test alert created successfully!`);
        console.log(`   Title: ${testAlert.title}`);
        console.log(`   Type: ${testAlert.type}`);
        console.log(`   Priority: ${testAlert.priority}`);
        console.log(`   Institution: ${institution.name}`);
        
        // Test the getActiveAlerts method
        console.log('\n=== TESTING ALERT RETRIEVAL ===\n');
        const activeAlerts = await Alert.getActiveAlerts(institution._id, 'students');
        console.log(`Found ${activeAlerts.length} active alerts for students:`);
        
        activeAlerts.forEach((alert, index) => {
            console.log(`   ${index + 1}. ${alert.title} (${alert.type}, ${alert.priority})`);
        });
        
    } catch (error) {
        console.error('❌ Error creating test alert:', error.message);
    }
    
    process.exit(0);
};

createTestAlert().catch(console.error);