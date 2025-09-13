const express = require('express');
const router = express.Router();
const { authMiddleware, studentOnly } = require('../middleware');

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// System prompt for disaster safety chatbot
const SYSTEM_PROMPT = `You are SafetyBot, an AI assistant specialized in disaster safety and emergency preparedness. You help students learn about:

- Fire safety (prevention, response, evacuation)
- Earthquake safety (Drop, Cover, Hold On, preparedness)
- Flood safety (prevention, emergency response)
- Cyclone safety (preparation, during/after actions)
- Pandemic safety (prevention, hygiene, quarantine)
- General emergency preparedness

Guidelines:
- Keep responses simple and appropriate for students
- Provide actionable safety advice
- Include emergency contact numbers when relevant (101 for fire, 108 for medical in India)
- Always emphasize getting help from adults in real emergencies
- Be encouraging and supportive
- If asked about non-safety topics, politely redirect to safety-related questions

Remember: You're helping students learn safety skills that could save lives.`;

// Chat with AI endpoint
router.post('/chat', authMiddleware, studentOnly, async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        // Make request to OpenRouter API
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'Safety Learning Platform'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0]) {
            throw new Error('Invalid response from OpenRouter API');
        }

        const aiResponse = data.choices[0].message.content;

        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot API error:', error);
        
        // Fallback response
        const fallbackResponse = `I'm having trouble connecting right now, but here are some general safety tips:

🔥 **Fire Safety**: Get out fast, call 101, don't go back inside
🌍 **Earthquake**: Drop, Cover, Hold On until shaking stops  
🌊 **Flood**: Move to high ground, avoid walking through water
🌪️ **Cyclone**: Stay indoors, away from windows during storms
🦠 **Health Emergency**: Wash hands, wear masks, tell adults if sick

For real emergencies, always call:
- Fire: 101
- Medical: 108
- Police: 100

Please try again or ask an adult for help!`;

        res.json({
            success: true,
            response: fallbackResponse,
            fallback: true,
            timestamp: new Date().toISOString()
        });
    }
});

// Get chat history (optional - can be implemented later)
router.get('/history', authMiddleware, studentOnly, async (req, res) => {
    try {
        // For now, return empty history
        // Can be implemented with database storage later
        res.json({
            success: true,
            history: [],
            message: 'Chat history feature coming soon!'
        });
    } catch (error) {
        console.error('Chat history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chat history'
        });
    }
});

module.exports = router;