const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5001/api';

// Your comprehensive disaster quiz data
const DISASTER_QUIZ_DATA = {
  "disasters_quiz": [
    {
      "disaster": "Earthquake",
      "questions": [
        {"question":"What is the safest action during an earthquake?","options":["Run outside immediately","Drop, Cover, Hold","Stand near a window","Climb a tree"],"answer":"Drop, Cover, Hold","difficulty":"easy","hint":"Follow NDMA guidelines."},
        {"question":"Where should you avoid standing during an earthquake?","options":["Under furniture","Near windows or heavy objects","In a doorway","On a carpet"],"answer":"Near windows or heavy objects","difficulty":"easy","hint":"Windows can shatter."},
        {"question":"Which area in India is most prone to earthquakes?","options":["Himalayan region","Thar Desert","Kerala coast","Rajasthan plains"],"answer":"Himalayan region","difficulty":"easy","hint":"High seismic zone."},
        {"question":"During an earthquake, it is safer to:","options":["Stand under a table","Stand in open ground","Sit near a window","Run upstairs"],"answer":"Stand in open ground","difficulty":"easy","hint":"Avoid falling debris."},
        {"question":"What is a safe place indoors during an earthquake?","options":["Near shelves","Under sturdy furniture","Near hanging lights","In a crowded corridor"],"answer":"Under sturdy furniture","difficulty":"easy","hint":"Protects head and body."},
        {"question":"What should you do after shaking stops?","options":["Resume class immediately","Evacuate safely if needed","Turn on electrical appliances","Jump from building"],"answer":"Evacuate safely if needed","difficulty":"medium","hint":"Check safety first."},
        {"question":"What is the first step in earthquake preparedness?","options":["Prepare emergency kit","Start running outside","Ignore minor tremors","Play in open ground"],"answer":"Prepare emergency kit","difficulty":"medium","hint":"Essential supplies."},
        {"question":"After an earthquake, what should you check first?","options":["Water and electricity lines","Social media","Homework","Toys"],"answer":"Water and electricity lines","difficulty":"medium","hint":"Prevent further accidents."},
        {"question":"Why is it dangerous to stand near bookshelves or heavy furniture during an earthquake?","options":["They can topple and injure you","They block your view","They are dusty","Nothing happens"],"answer":"They can topple and injure you","difficulty":"hard","hint":"Falling objects are dangerous."},
        {"question":"During a major earthquake, why should people avoid using elevators?","options":["They can get stuck or malfunction","They move too slowly","They are crowded","They are expensive to maintain"],"answer":"They can get stuck or malfunction","difficulty":"hard","hint":"Elevators may fail in tremors."}
      ]
    },
    {
      "disaster": "Flood",
      "questions": [
        {"question":"What should you do during a flood?","options":["Move to higher ground","Play in water","Walk through deep water","Stay near electrical lines"],"answer":"Move to higher ground","difficulty":"easy","hint":"Avoid rising water."},
        {"question":"Which items should you avoid during a flood?","options":["Water and food","Electrical wires and outlets","Life jackets","Boats"],"answer":"Electrical wires and outlets","difficulty":"easy","hint":"Electricity and water are dangerous."},
        {"question":"Which season in India is flood-prone?","options":["Monsoon","Winter","Summer","Spring"],"answer":"Monsoon","difficulty":"easy","hint":"Heavy rains occur then."},
        {"question":"During a flood, how should you evacuate?","options":["Use boats or safe routes","Walk through deep water","Drive through flooded roads","Climb trees immediately"],"answer":"Use boats or safe routes","difficulty":"easy","hint":"Follow safe paths."},
        {"question":"After a flood, it is important to:","options":["Drink only safe water","Eat anything found","Enter damaged buildings","Use electricity immediately"],"answer":"Drink only safe water","difficulty":"easy","hint":"Avoid waterborne diseases."},
        {"question":"What is the first step in flood preparedness?","options":["Stock emergency kit","Swim in rivers","Ignore warnings","Build sandcastles"],"answer":"Stock emergency kit","difficulty":"medium","hint":"Prepare essentials."},
        {"question":"During floods, what should be avoided?","options":["Staying indoors","Using electrical appliances","Following evacuation instructions","Helping neighbors"],"answer":"Using electrical appliances","difficulty":"medium","hint":"Electrical shock risk."},
        {"question":"Which Indian states are highly affected by floods?","options":["Assam, Bihar, Kerala","Rajasthan, Gujarat, Haryana","Punjab, Himachal","Tamil Nadu, Karnataka, Goa"],"answer":"Assam, Bihar, Kerala","difficulty":"medium","hint":"Low-lying, riverine states."},
        {"question":"Why should you avoid swimming in floodwater?","options":["It may contain debris or pathogens","It's boring","It helps you exercise","It's fun"],"answer":"It may contain debris or pathogens","difficulty":"hard","hint":"Water is contaminated."},
        {"question":"Why is moving to higher ground important during a flood?","options":["Avoids fast-rising water","Better view","Good for photos","To exercise"],"answer":"Avoids fast-rising water","difficulty":"hard","hint":"Prevents drowning."}
      ]
    },
    {
      "disaster": "Fire Accidents",
      "questions": [
        {"question":"What should you do first during a fire?","options":["Raise alarm","Hide under desk","Use water on electrical fire","Ignore it"],"answer":"Raise alarm","difficulty":"easy","hint":"Alert others immediately."},
        {"question":"Which method is used to escape fire safely?","options":["Safe exit via stairs","Use elevator","Jump from window","Run randomly"],"answer":"Safe exit via stairs","difficulty":"easy","hint":"Elevators are dangerous."},
        {"question":"What is 'Stop, Drop, Roll' used for?","options":["If clothes catch fire","During earthquake","During flood","During cyclone"],"answer":"If clothes catch fire","difficulty":"easy","hint":"Extinguish fire on body."},
        {"question":"In schools, fire drills are conducted to:","options":["Practice safe evacuation","Play games","Test fire alarms only","Decorate building"],"answer":"Practice safe evacuation","difficulty":"easy","hint":"Prepare students."},
        {"question":"Where should you not go during a fire?","options":["Near fire or smoke","Safe exit","Evacuation area","Open space"],"answer":"Near fire or smoke","difficulty":"easy","hint":"Smoke inhalation is dangerous."},
        {"question":"Which fire extinguisher should be used on electrical fires?","options":["CO2 extinguisher","Water extinguisher","Foam extinguisher","Sand"],"answer":"CO2 extinguisher","difficulty":"medium","hint":"Non-conductive."},
        {"question":"How should you move during a fire in a smoke-filled area?","options":["Crawl low to the ground","Stand upright","Jump","Run blindly"],"answer":"Crawl low to the ground","difficulty":"medium","hint":"Smoke rises, stay low."},
        {"question":"What should be checked regularly to prevent fire?","options":["Electrical wiring and appliances","Food menu","School timetable","Sports schedule"],"answer":"Electrical wiring and appliances","difficulty":"medium","hint":"Prevent accidents."},
        {"question":"Why should you never use elevators during a fire?","options":["They may trap you","They move too slowly","They are crowded","They are expensive"],"answer":"They may trap you","difficulty":"hard","hint":"Elevators can fail."},
        {"question":"Why is it important to stay calm during a fire?","options":["It helps evacuate safely","You look brave","It entertains others","It saves furniture"],"answer":"It helps evacuate safely","difficulty":"hard","hint":"Panic leads to accidents."}
      ]
    }
  ]
};

async function setupQuizTest() {
  console.log('🚀 Starting comprehensive quiz setup...\n');
  
  try {
    // Step 1: Create Institution
    console.log('1️⃣ Creating test institution...');
    let institutionToken;
    
    try {
      const institutionRegister = await axios.post(`${API_BASE_URL}/institution/register`, {
        name: "Disaster Preparedness Institute",
        institutionId: "DPI2024",
        email: "admin@dpi2024.edu",
        password: "AdminPass123!",
        phone: "+91-9876543210",
        location: "New Delhi, India"
      });
      
      institutionToken = institutionRegister.data.token;
      console.log('✅ Institution created successfully');
      console.log('📧 Email: admin@dpi2024.edu');
      console.log('🔐 Password: AdminPass123!');
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.message.includes('already exists')) {
        console.log('📝 Institution already exists, logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/institution/login`, {
          email: "admin@dpi2024.edu",
          password: "AdminPass123!"
        });
        institutionToken = loginResponse.data.token;
        console.log('✅ Institution login successful');
      } else {
        throw error;
      }
    }

    // Step 2: Create Student
    console.log('\n2️⃣ Creating test student...');
    let studentToken;
    
    try {
      const studentRegister = await axios.post(`${API_BASE_URL}/student/register`, {
        institutionId: "DPI2024",
        name: "Priya Sharma",
        rollNo: "DM2024001",
        email: "priya@dpi2024.edu",
        password: "Student123!",
        class: "12",
        division: "A",
        phone: "+91-9876543211",
        parentPhone: "+91-9876543212"
      });
      
      studentToken = studentRegister.data.token;
      console.log('✅ Student created successfully');
      console.log('📧 Email: priya@dpi2024.edu');
      console.log('🔐 Password: Student123!');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('📝 Student already exists, logging in...');
        const loginResponse = await axios.post(`${API_BASE_URL}/student/login`, {
          email: "priya@dpi2024.edu",
          password: "Student123!"
        });
        studentToken = loginResponse.data.token;
        console.log('✅ Student login successful');
      } else {
        throw error;
      }
    }

    // Step 3: Get/Create Modules
    console.log('\n3️⃣ Setting up modules...');
    const modulesResponse = await axios.get(`${API_BASE_URL}/modules`);
    let modules = modulesResponse.data;
    
    console.log(`📚 Found ${modules.length} existing modules`);
    
    // If no modules, create them
    if (modules.length === 0) {
      console.log('Creating new modules...');
      
      const moduleData = [
        {
          title: "Natural Disasters",
          description: "Comprehensive guide to understanding and preparing for natural disasters in India",
          thumbnail: "https://example.com/natural-disasters.jpg",
          chapters: [
            {
              title: "Earthquake Safety",
              contents: [{
                type: "text",
                body: "Learn essential earthquake safety measures and preparedness strategies."
              }]
            },
            {
              title: "Flood Management",
              contents: [{
                type: "text", 
                body: "Understanding flood risks and emergency response procedures."
              }]
            }
          ]
        },
        {
          title: "Man-made Disasters",
          description: "Understanding and preventing man-made disasters and emergencies",
          thumbnail: "https://example.com/manmade-disasters.jpg",
          chapters: [
            {
              title: "Fire Safety",
              contents: [{
                type: "text",
                body: "Fire prevention, detection systems, and evacuation procedures."
              }]
            }
          ]
        }
      ];

      for (const module of moduleData) {
        const createResponse = await axios.post(`${API_BASE_URL}/institution/modules`, module, {
          headers: { Authorization: `Bearer ${institutionToken}` }
        });
        modules.push(createResponse.data);
        console.log(`✅ Created module: ${module.title}`);
      }
    }

    // Step 4: Create Quizzes from your disaster data
    console.log('\n4️⃣ Creating disaster preparedness quizzes...');
    
    for (const disasterData of DISASTER_QUIZ_DATA.disasters_quiz) {
      console.log(`\n🔥 Creating ${disasterData.disaster} quiz...`);
      
      // Convert your format to our quiz format
      const questions = disasterData.questions.map(q => {
        const correctOptionIndex = q.options.findIndex(opt => opt === q.answer);
        
        return {
          question: q.question,
          options: q.options.map((option, index) => ({
            text: option,
            isCorrect: index === correctOptionIndex
          })),
          difficulty: q.difficulty,
          explanation: `${q.hint} The correct answer is: ${q.answer}`,
          points: q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3,
          hints: [{
            text: q.hint,
            penalty: 0.1
          }]
        };
      });

      // Find appropriate module (use first module for all for simplicity)
      const moduleId = modules[0]._id;

      const quizData = {
        title: `${disasterData.disaster} Safety Quiz`,
        description: `Test your knowledge about ${disasterData.disaster.toLowerCase()} safety and preparedness measures.`,
        moduleId: moduleId,
        questions: questions,
        settings: {
          timeLimit: Math.max(questions.length * 2, 15), // 2 minutes per question, minimum 15
          passingScore: 70,
          maxAttempts: 3,
          randomizeQuestions: false,
          randomizeOptions: true,
          showCorrectAnswers: true,
          allowRetake: true,
          retakeDelay: 0
        },
        status: 'published'
      };

      try {
        const quizResponse = await axios.post(`${API_BASE_URL}/institution/quizzes`, quizData, {
          headers: { 
            Authorization: `Bearer ${institutionToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Created "${disasterData.disaster} Safety Quiz" with ${questions.length} questions`);
        console.log(`   Quiz ID: ${quizResponse.data._id}`);
        
      } catch (error) {
        if (error.response?.data) {
          console.log(`❌ Error creating ${disasterData.disaster} quiz:`, error.response.data.message);
        } else {
          console.log(`❌ Error creating ${disasterData.disaster} quiz:`, error.message);
        }
      }
    }

    // Step 5: Test the quiz system
    console.log('\n5️⃣ Testing quiz system...');
    
    // Get all quizzes as student
    const studentQuizzesResponse = await axios.get(`${API_BASE_URL}/student/quizzes`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const availableQuizzes = studentQuizzesResponse.data.quizzes;
    console.log(`📝 Found ${availableQuizzes.length} available quizzes for students`);
    
    if (availableQuizzes.length > 0) {
      const firstQuiz = availableQuizzes[0];
      console.log(`\n🎯 Testing first quiz: "${firstQuiz.title}"`);
      
      // Start quiz attempt
      const startResponse = await axios.post(`${API_BASE_URL}/student/quiz/start`, {
        quizId: firstQuiz.id
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log(`✅ Started quiz attempt: ${startResponse.data.attemptId}`);
      
      // Get quiz details to see questions
      const quizDetailsResponse = await axios.get(`${API_BASE_URL}/quizzes/${firstQuiz.id}`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      
      console.log(`📋 Quiz has ${quizDetailsResponse.data.questions.length} questions`);
      console.log(`⏰ Time limit: ${quizDetailsResponse.data.settings.timeLimit} minutes`);
      console.log(`🎯 Passing score: ${quizDetailsResponse.data.settings.passingScore}%`);
    }

    console.log('\n🎉 SETUP COMPLETE! 🎉');
    console.log('\n📋 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏫 Institution Login:');
    console.log('   📧 Email: admin@dpi2024.edu');
    console.log('   🔐 Password: AdminPass123!');
    console.log('');
    console.log('👨‍🎓 Student Login:');
    console.log('   📧 Email: priya@dpi2024.edu');
    console.log('   🔐 Password: Student123!');
    console.log('');
    console.log('🚀 API Base URL: http://localhost:5001/api');
    console.log('📚 Modules Created: ✅');
    console.log('🧩 Disaster Quizzes Created: ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Setup failed:', error.response?.data || error.message);
  }
}

// Run setup
setupQuizTest();
