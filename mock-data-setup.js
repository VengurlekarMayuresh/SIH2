const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Institution = require('./backend/models/Institution');
const Student = require('./backend/models/Student');
const Module = require('./backend/models/Module');
const Quiz = require('./backend/models/Quiz');
const Badge = require('./backend/models/Badge');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/safety-learning');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Mock Data
const mockInstitutions = [
  {
    name: "Lincoln High School",
    institutionId: "LHS001",
    email: "admin@lincolnhigh.edu",
    password: "admin123",
    phone: "+1-555-0101",
    address: "123 Education St, Springfield, IL 62701",
    location: {
      city: "Springfield",
      state: "Illinois",
      country: "USA"
    },
    principalName: "Dr. Sarah Johnson",
    establishedYear: 1985,
    totalStudents: 1200,
    website: "https://lincolnhigh.edu"
  },
  {
    name: "Riverside Academy",
    institutionId: "RSA002",
    email: "admin@riverside.edu",
    password: "admin123",
    phone: "+1-555-0202",
    address: "456 River Road, Austin, TX 73301",
    location: {
      city: "Austin",
      state: "Texas",
      country: "USA"
    },
    principalName: "Prof. Michael Chen",
    establishedYear: 1995,
    totalStudents: 800,
    website: "https://riverside.edu"
  },
  {
    name: "Greenfield College Prep",
    institutionId: "GCP003",
    email: "admin@greenfield.edu",
    password: "admin123",
    phone: "+1-555-0303",
    address: "789 Campus Drive, Seattle, WA 98101",
    location: {
      city: "Seattle",
      state: "Washington",
      country: "USA"
    },
    principalName: "Dr. Emily Rodriguez",
    establishedYear: 1978,
    totalStudents: 1500,
    website: "https://greenfield.edu"
  }
];

const mockStudents = [
  // Lincoln High School Students
  {
    name: "Alex Thompson",
    email: "alex.thompson@student.lincolnhigh.edu",
    password: "student123",
    rollNo: "LHS2024001",
    class: "12",
    division: "A",
    year: "2024",
    phone: "+1-555-1001",
    parentPhone: "+1-555-1002",
    institutionId: "LHS001"
  },
  {
    name: "Sarah Wilson",
    email: "sarah.wilson@student.lincolnhigh.edu",
    password: "student123",
    rollNo: "LHS2024002",
    class: "11",
    division: "B",
    year: "2024",
    phone: "+1-555-1003",
    parentPhone: "+1-555-1004",
    institutionId: "LHS001"
  },
  {
    name: "Mike Johnson",
    email: "mike.johnson@student.lincolnhigh.edu",
    password: "student123",
    rollNo: "LHS2024003",
    class: "12",
    division: "A",
    year: "2024",
    phone: "+1-555-1005",
    parentPhone: "+1-555-1006",
    institutionId: "LHS001"
  },
  
  // Riverside Academy Students
  {
    name: "Emma Davis",
    email: "emma.davis@student.riverside.edu",
    password: "student123",
    rollNo: "RSA2024001",
    class: "10",
    division: "A",
    year: "2024",
    phone: "+1-555-2001",
    parentPhone: "+1-555-2002",
    institutionId: "RSA002"
  },
  {
    name: "James Brown",
    email: "james.brown@student.riverside.edu",
    password: "student123",
    rollNo: "RSA2024002",
    class: "11",
    division: "B",
    year: "2024",
    phone: "+1-555-2003",
    parentPhone: "+1-555-2004",
    institutionId: "RSA002"
  },
  
  // Greenfield College Prep Students
  {
    name: "Olivia Martinez",
    email: "olivia.martinez@student.greenfield.edu",
    password: "student123",
    rollNo: "GCP2024001",
    class: "12",
    division: "A",
    year: "2024",
    phone: "+1-555-3001",
    parentPhone: "+1-555-3002",
    institutionId: "GCP003"
  },
  {
    name: "Daniel Lee",
    email: "daniel.lee@student.greenfield.edu",
    password: "student123",
    rollNo: "GCP2024002",
    class: "10",
    division: "C",
    year: "2024",
    phone: "+1-555-3003",
    parentPhone: "+1-555-3004",
    institutionId: "GCP003"
  }
];

const mockModules = [
  {
    title: "Fire Safety Fundamentals",
    description: "Essential fire safety principles and emergency response procedures",
    thumbnail: "https://images.unsplash.com/photo-1583470275174-85c6b3e32a0c?w=500",
    chapters: [
      {
        title: "Understanding Fire Hazards",
        contents: [
          {
            type: "text",
            body: "Fire is a chemical reaction that occurs when three elements come together: heat, fuel, and oxygen. This is known as the fire triangle. Understanding these elements is crucial for fire prevention and safety."
          },
          {
            type: "video", 
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
          }
        ]
      },
      {
        title: "Fire Prevention Strategies",
        contents: [
          {
            type: "text",
            body: "Prevention is the best protection against fire. This includes proper storage of flammable materials, regular maintenance of electrical systems, and implementation of safety protocols."
          }
        ]
      }
    ]
  },
  {
    title: "Earthquake Preparedness",
    description: "Comprehensive earthquake safety and response training",
    thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=500",
    chapters: [
      {
        title: "Understanding Earthquakes",
        contents: [
          {
            type: "text",
            body: "Earthquakes are sudden ground movements caused by the shifting of tectonic plates. Understanding how and why earthquakes occur helps in preparing for them."
          }
        ]
      },
      {
        title: "Drop, Cover, and Hold On",
        contents: [
          {
            type: "text",
            body: "The Drop, Cover, and Hold On technique is the recommended response during earthquake shaking. Drop to hands and knees, take cover under a sturdy surface, and hold on."
          },
          {
            type: "image",
            imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=500"
          }
        ]
      }
    ]
  },
  {
    title: "Emergency Response Planning",
    description: "Creating and implementing effective emergency response plans",
    thumbnail: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=500",
    chapters: [
      {
        title: "Emergency Communication",
        contents: [
          {
            type: "text",
            body: "Effective communication during emergencies can save lives. Learn about emergency communication protocols and systems."
          }
        ]
      }
    ]
  }
];

const mockQuizzes = [
  {
    title: "Fire Safety Basics Quiz",
    description: "Test your knowledge of fundamental fire safety principles",
    moduleId: null, // Will be set after modules are created
    questions: [
      {
        question: "What are the three elements of the fire triangle?",
        options: [
          { text: "Heat, Fuel, Oxygen", isCorrect: true },
          { text: "Heat, Water, Air", isCorrect: false },
          { text: "Fuel, Water, Oxygen", isCorrect: false },
          { text: "Heat, Fuel, Carbon", isCorrect: false }
        ],
        difficulty: "easy",
        explanation: "The fire triangle consists of heat, fuel, and oxygen. Remove any one of these elements and the fire cannot exist.",
        points: 10,
        timeLimit: 30,
        hints: [
          { text: "Think about what fire needs to survive", penalty: 0.1 }
        ]
      },
      {
        question: "What should you do FIRST when you discover a fire?",
        options: [
          { text: "Try to put it out", isCorrect: false },
          { text: "Sound the alarm", isCorrect: true },
          { text: "Call your supervisor", isCorrect: false },
          { text: "Gather your belongings", isCorrect: false }
        ],
        difficulty: "medium",
        explanation: "Always sound the alarm first to alert everyone in the building. Your safety and others' safety is the top priority.",
        points: 15,
        timeLimit: 25,
        hints: [
          { text: "Think about alerting others", penalty: 0.1 }
        ]
      },
      {
        question: "How often should smoke detector batteries be tested?",
        options: [
          { text: "Once a year", isCorrect: false },
          { text: "Every 6 months", isCorrect: false },
          { text: "Monthly", isCorrect: true },
          { text: "Weekly", isCorrect: false }
        ],
        difficulty: "easy",
        explanation: "Smoke detectors should be tested monthly to ensure they work properly. Replace batteries at least once a year.",
        points: 10,
        timeLimit: 20
      }
    ],
    settings: {
      timeLimit: 30,
      passingScore: 70,
      maxAttempts: 3,
      randomizeQuestions: false,
      randomizeOptions: true,
      showCorrectAnswers: true,
      allowRetake: true,
      retakeDelay: 0
    },
    status: 'published'
  },
  {
    title: "Earthquake Safety Assessment",
    description: "Evaluate your earthquake preparedness knowledge",
    moduleId: null, // Will be set after modules are created
    questions: [
      {
        question: "During an earthquake, what should you do if you're indoors?",
        options: [
          { text: "Run outside immediately", isCorrect: false },
          { text: "Stand in a doorway", isCorrect: false },
          { text: "Drop, Cover, and Hold On", isCorrect: true },
          { text: "Hide under stairs", isCorrect: false }
        ],
        difficulty: "medium",
        explanation: "Drop to hands and knees, take cover under a sturdy desk or table, and hold on. This protects you from falling objects.",
        points: 15,
        timeLimit: 30,
        hints: [
          { text: "Remember the three-word safety phrase", penalty: 0.1 }
        ]
      },
      {
        question: "After an earthquake stops, what should you do first?",
        options: [
          { text: "Check for injuries", isCorrect: true },
          { text: "Turn on the TV", isCorrect: false },
          { text: "Go outside immediately", isCorrect: false },
          { text: "Take photos", isCorrect: false }
        ],
        difficulty: "medium",
        explanation: "Check yourself and others for injuries first. Provide first aid if needed before doing anything else.",
        points: 15,
        timeLimit: 25
      }
    ],
    settings: {
      timeLimit: 25,
      passingScore: 75,
      maxAttempts: 3,
      randomizeQuestions: true,
      randomizeOptions: true,
      showCorrectAnswers: true,
      allowRetake: true,
      retakeDelay: 0
    },
    status: 'published'
  },
  {
    title: "Emergency Communication Quiz",
    description: "Test your knowledge of emergency communication protocols",
    moduleId: null, // Will be set after modules are created
    questions: [
      {
        question: "What is the universal emergency number in the US?",
        options: [
          { text: "991", isCorrect: false },
          { text: "911", isCorrect: true },
          { text: "999", isCorrect: false },
          { text: "112", isCorrect: false }
        ],
        difficulty: "easy",
        explanation: "911 is the universal emergency number in the United States for police, fire, and medical emergencies.",
        points: 10,
        timeLimit: 15
      },
      {
        question: "During an emergency, what information should you provide to emergency services?",
        options: [
          { text: "Only your location", isCorrect: false },
          { text: "Location, nature of emergency, number of people involved", isCorrect: true },
          { text: "Only your name", isCorrect: false },
          { text: "Only the emergency type", isCorrect: false }
        ],
        difficulty: "medium",
        explanation: "Provide your location, the nature of the emergency, number of people involved, and any other relevant details.",
        points: 15,
        timeLimit: 30
      }
    ],
    settings: {
      timeLimit: 20,
      passingScore: 80,
      maxAttempts: 2,
      randomizeQuestions: false,
      randomizeOptions: false,
      showCorrectAnswers: true,
      allowRetake: true,
      retakeDelay: 0
    },
    status: 'published'
  }
];

// Setup function
const setupMockData = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    
    // Clear existing data
    await Institution.deleteMany({});
    await Student.deleteMany({});
    await Module.deleteMany({});
    await Quiz.deleteMany({});
    
    console.log('🏫 Creating institutions...');
    
    // Create institutions with hashed passwords
    const createdInstitutions = [];
    for (const institution of mockInstitutions) {
      const hashedPassword = await bcrypt.hash(institution.password, 12);
      const newInstitution = await Institution.create({
        ...institution,
        password: hashedPassword
      });
      createdInstitutions.push(newInstitution);
      console.log(`✅ Created institution: ${institution.name} (ID: ${institution.institutionId})`);
    }
    
    console.log('📚 Creating modules...');
    
    // Create modules
    const createdModules = [];
    for (const module of mockModules) {
      const newModule = await Module.create(module);
      createdModules.push(newModule);
      console.log(`✅ Created module: ${module.title}`);
    }
    
    console.log('📝 Creating quizzes...');
    
    // Create quizzes and assign to modules
    const createdQuizzes = [];
    for (let i = 0; i < mockQuizzes.length; i++) {
      const quiz = mockQuizzes[i];
      quiz.moduleId = createdModules[i % createdModules.length]._id;
      const newQuiz = await Quiz.create(quiz);
      createdQuizzes.push(newQuiz);
      console.log(`✅ Created quiz: ${quiz.title}`);
    }
    
    console.log('🎓 Creating students...');
    
    // Create students with hashed passwords and correct institution references
    const createdStudents = [];
    for (const student of mockStudents) {
      // Find the institution by institutionId string
      const institution = createdInstitutions.find(inst => inst.institutionId === student.institutionId);
      if (!institution) {
        console.error(`❌ Institution not found for student: ${student.name}`);
        continue;
      }
      
      const hashedPassword = await bcrypt.hash(student.password, 12);
      const newStudent = await Student.create({
        ...student,
        password: hashedPassword,
        institutionId: institution._id // Use the ObjectId reference
      });
      createdStudents.push(newStudent);
      console.log(`✅ Created student: ${student.name} at ${institution.name}`);
    }
    
    console.log('🏆 Creating default badges...');
    
    // Create default badges
    await Badge.createDefaultBadges();
    
    console.log('\n🎉 Mock data setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${createdInstitutions.length} institutions created`);
    console.log(`   • ${createdStudents.length} students created`);
    console.log(`   • ${createdModules.length} modules created`);
    console.log(`   • ${createdQuizzes.length} quizzes created`);
    
    return {
      institutions: createdInstitutions,
      students: createdStudents,
      modules: createdModules,
      quizzes: createdQuizzes
    };
    
  } catch (error) {
    console.error('❌ Error setting up mock data:', error);
    throw error;
  }
};

// Run setup if called directly
if (require.main === module) {
  connectDB().then(async () => {
    try {
      await setupMockData();
      process.exit(0);
    } catch (error) {
      console.error('Setup failed:', error);
      process.exit(1);
    }
  });
}

module.exports = { setupMockData, connectDB, mockInstitutions, mockStudents };
