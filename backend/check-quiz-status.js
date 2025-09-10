const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const Quiz = require('./models/Quiz');
const Module = require('./models/Module');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-prep-edu';

async function checkAndFixQuizStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all quizzes and their status
    const allQuizzes = await Quiz.find({}).populate('moduleId', 'title');
    
    console.log(`\nFound ${allQuizzes.length} quizzes in database:`);
    console.log('='.repeat(50));
    
    let draftCount = 0;
    let publishedCount = 0;
    let archivedCount = 0;
    
    for (const quiz of allQuizzes) {
      console.log(`📝 ${quiz.title}`);
      console.log(`   Status: ${quiz.status}`);
      console.log(`   Module: ${quiz.moduleId?.title || 'Unknown'}`);
      console.log(`   Questions: ${quiz.questions.length}`);
      console.log(`   Created: ${quiz.createdAt}`);
      console.log('   ---');
      
      if (quiz.status === 'draft') draftCount++;
      else if (quiz.status === 'published') publishedCount++;
      else if (quiz.status === 'archived') archivedCount++;
    }
    
    console.log(`\n📊 Status Summary:`);
    console.log(`   Published: ${publishedCount}`);
    console.log(`   Draft: ${draftCount}`);
    console.log(`   Archived: ${archivedCount}`);
    
    // If there are any draft quizzes, offer to publish them
    if (draftCount > 0) {
      console.log(`\n🔧 Found ${draftCount} draft quizzes. Publishing them...`);
      
      const result = await Quiz.updateMany(
        { status: 'draft' }, 
        { status: 'published' }
      );
      
      console.log(`✅ Published ${result.modifiedCount} quizzes`);
      
      // Show updated status
      const updatedQuizzes = await Quiz.find({ status: 'published' });
      console.log(`\n🎯 Now there are ${updatedQuizzes.length} published quizzes available to students`);
    } else {
      console.log(`\n✅ All quizzes are already in correct status`);
    }
    
    // Check if quiz questions have proper structure
    console.log(`\n🔍 Checking quiz question structure...`);
    for (const quiz of allQuizzes) {
      if (quiz.questions.length === 0) {
        console.log(`⚠️  Quiz "${quiz.title}" has no questions!`);
        continue;
      }
      
      for (const [index, question] of quiz.questions.entries()) {
        if (!question.options || question.options.length < 2) {
          console.log(`⚠️  Quiz "${quiz.title}" - Question ${index + 1} has insufficient options`);
        }
        
        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          console.log(`⚠️  Quiz "${quiz.title}" - Question ${index + 1} has no correct answer marked!`);
        }
      }
    }
    
    console.log(`\n✅ Quiz structure check completed`);
    
  } catch (error) {
    console.error('Error checking quiz status:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
checkAndFixQuizStatus();
