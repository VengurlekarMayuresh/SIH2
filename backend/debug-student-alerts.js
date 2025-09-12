require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
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

const debugStudentAlerts = async () => {
    await connectDb();
    
    console.log('\n=== DEBUGGING STUDENT ALERTS ===\n');
    
    // Find a student with an institution
    const student = await Student.findOne({ institutionId: { $exists: true } }).populate('institutionId');
    
    if (!student) {
        console.log('❌ No student with institution found');
        process.exit(0);
    }
    
    console.log('Student Data:');
    console.log(`  Name: ${student.name}`);
    console.log(`  Email: ${student.email}`);
    console.log(`  Class: ${student.class}`);
    console.log(`  Division: ${student.division}`);
    console.log(`  Institution ObjectId: ${student.institutionId._id}`);
    console.log(`  Institution Name: ${student.institutionId.name}`);
    
    // Test what the login would return
    const loginResponse = {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        class: student.class,
        division: student.division,
        institutionId: student.institutionId,
        institution: student.institutionId
    };
    
    console.log('\nLogin Response institutionId:');
    console.log(`  Type: ${typeof loginResponse.institutionId}`);
    console.log(`  Value: ${JSON.stringify(loginResponse.institutionId, null, 2)}`);
    
    // Test alert retrieval
    console.log('\n=== TESTING ALERT RETRIEVAL FOR THIS STUDENT ===\n');
    
    const institutionObjectId = student.institutionId._id;
    console.log(`Looking for alerts for institution ObjectId: ${institutionObjectId}`);
    
    const activeAlerts = await Alert.getActiveAlerts(institutionObjectId, 'students', student.class);
    console.log(`Found ${activeAlerts.length} active alerts for this student:`);
    
    activeAlerts.forEach((alert, index) => {
        console.log(`  ${index + 1}. ${alert.title}`);
        console.log(`     Type: ${alert.type}, Priority: ${alert.priority}`);
        console.log(`     Target Audience: ${alert.targetAudience}`);
        console.log(`     Target Class: ${alert.targetClass || 'N/A'}`);
        console.log(`     Active: ${alert.isActive}`);
        console.log(`     Institution ID: ${alert.institutionId}`);
        console.log('');
    });
    
    // Test the direct query that AlertDisplay would use
    console.log('=== SIMULATING FRONTEND API CALL ===\n');
    console.log(`URL that frontend would call:`);
    console.log(`  http://localhost:5001/api/alerts/active/${institutionObjectId}?targetAudience=students&targetClass=${student.class}`);
    
    process.exit(0);
};

debugStudentAlerts().catch(console.error);