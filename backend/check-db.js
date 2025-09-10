const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Institution = require('./models/Institution');
const Student = require('./models/Student');

const checkDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB\n');

        // Check institutions
        console.log('📊 INSTITUTIONS:');
        const institutions = await Institution.find({}).select('name institutionId email');
        
        if (institutions.length === 0) {
            console.log('❌ No institutions found');
        } else {
            institutions.forEach(inst => {
                console.log(`✅ ${inst.name} (${inst.institutionId}) - ${inst.email}`);
            });
        }

        // Check students
        console.log('\n👥 STUDENTS:');
        const students = await Student.find({}).select('name email institutionId class rollNo').populate('institutionId', 'name institutionId');
        
        if (students.length === 0) {
            console.log('❌ No students found');
        } else {
            students.forEach(student => {
                const institutionInfo = student.institutionId 
                    ? `${student.institutionId.name} (${student.institutionId.institutionId})`
                    : 'Independent';
                console.log(`✅ ${student.name} - ${student.email} - Institution: ${institutionInfo}`);
            });
        }

        // Test password verification for TEST001 institution
        console.log('\n🔐 PASSWORD VERIFICATION TEST:');
        const testInstitution = await Institution.findOne({ institutionId: 'TEST001' });
        if (testInstitution) {
            const passwordMatch = await bcrypt.compare('testpass123', testInstitution.password);
            console.log(`Password 'testpass123' matches stored hash: ${passwordMatch ? '✅ YES' : '❌ NO'}`);
        } else {
            console.log('❌ TEST001 institution not found');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
};

checkDatabase();
