// Test data creation script
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

// Import models
const Institution = require('./models/Institution');
const Student = require('./models/Student');

const createTestData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create fresh test institution (delete and recreate to ensure known password)
        await Institution.deleteOne({ institutionId: 'FRESH001' });
        await Student.deleteMany({ institutionId: { $exists: true } }).then(result => {
            const deletedStudents = result.deletedCount;
            if (deletedStudents > 0) {
                console.log(`Deleted ${deletedStudents} old test students`);
            }
        });
        
        const hashedPassword = await bcrypt.hash('testpass123', 12);
        const testInstitution = new Institution({
            name: 'Fresh Test High School',
            institutionId: 'FRESH001',
            email: 'admin@freshtest.edu',
            password: hashedPassword,
            phone: '9876543210',
            location: {
                state: 'Maharashtra',
                district: 'Pune', 
                city: 'Pune',
                pincode: '411001',
                address: '123 Fresh Education Street'
            }
        });
        await testInstitution.save();
        console.log('Created fresh test institution: FRESH001 with email admin@freshtest.edu');

        // Create test students
        const testStudentsData = [
            {
                name: 'Alice Johnson',
                rollNo: 'R001',
                class: '10',
                division: 'A',
                email: 'alice@student.test',
                phone: '9876511111'
            },
            {
                name: 'Bob Smith',
                rollNo: 'R002', 
                class: '10',
                division: 'A',
                email: 'bob@student.test',
                phone: '9876522222'
            },
            {
                name: 'Charlie Brown',
                rollNo: 'R003',
                class: '10',
                division: 'B',
                email: 'charlie@student.test',
                phone: '9876533333'
            },
            {
                name: 'Diana Prince',
                rollNo: 'R004',
                class: '11',
                division: 'A',
                email: 'diana@student.test',
                phone: '9876544444'
            },
            {
                name: 'Edward Wilson',
                rollNo: 'R005',
                class: '11',
                division: 'B',
                email: 'edward@student.test',
                phone: '9876555555'
            }
        ];

        for (const studentData of testStudentsData) {
            const existingStudent = await Student.findOne({ 
                institutionId: testInstitution._id, 
                email: studentData.email 
            });
            
            if (!existingStudent) {
                const hashedPassword = await bcrypt.hash('student123', 12);
                const student = new Student({
                    ...studentData,
                    institutionId: testInstitution._id,
                    password: hashedPassword,
                    parentPhone: '9876599999'
                });
                await student.save();
                console.log(`Created student: ${studentData.name}`);
            } else {
                console.log(`Student already exists: ${studentData.name}`);
            }
        }

        // Create an independent student (no institution)
        const independentExists = await Student.findOne({ 
            email: 'independent@student.test',
            institutionId: { $exists: false }
        });
        
        if (!independentExists) {
            const hashedPassword = await bcrypt.hash('independent123', 12);
            const independentStudent = new Student({
                name: 'Frank Independent',
                email: 'independent@student.test',
                password: hashedPassword,
                phone: '9876566666',
                parentPhone: '9876577777',
                // No institutionId, rollNo, class, division for independent student
            });
            await independentStudent.save();
            console.log('Created independent student: Frank Independent');
        } else {
            console.log('Independent student already exists');
        }

        console.log('\n✅ Test data creation completed!');
        console.log('\nTest Institution Login:');
        console.log('Email: admin@freshtest.edu');
        console.log('Password: testpass123');
        console.log('\nTest Student Logins:');
        console.log('Alice: alice@student.test / student123');
        console.log('Bob: bob@student.test / student123');
        console.log('Independent: independent@student.test / independent123');
        
    } catch (error) {
        console.error('Error creating test data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
};

createTestData();
