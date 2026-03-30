require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3001;

// DeepSeek API 配置
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'; // 或 deepseek-coder
const DEEPSEEK_SYSTEM_PROMPT = process.env.DEEPSEEK_SYSTEM_PROMPT;

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:5173' // Replace with your frontend's actual origin
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}); // For parsing application/json

// Test endpoint
app.get('/api/test', (req, res) => {
  // 模拟一个故事对象来生成系统提示词
  const mockStory = {
    title: '模拟汤面标题',
    bottom: '模拟汤底内容，用于测试系统提示词加载。'
  };

  res.json({
      message: 'Backend is working!',
      timestamp: new Date(),
      currentSystemPrompt: DEEPSEEK_SYSTEM_PROMPT,
      loadedApiKey: DEEPSEEK_API_KEY ? `${DEEPSEEK_API_KEY.substring(0, 5)}...${DEEPSEEK_API_KEY.substring(DEEPSEEK_API_KEY.length - 5)}` : 'Not Loaded'
    });
});

// Service info endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AI Haigui Game Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      test: '/api/test (GET)',
      chat: '/api/chat (POST)'
    },
    message: 'Welcome to the AI Haigui Game Backend!'
  });
});

// AI chat endpoint
app.post('/api/chat', async (req, res) => {
  const { question, story } = req.body;

  if (!question || !story || !story.title || !story.bottom) {
    return res.status(400).json({ error: 'Missing question or story details.' });
  }

  if (!DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: AI API key missing.' });
  }

  try {
    console.log('---------- AI Chat Request Details ----------');
    console.log(`Player Question: "${question}"`);
    console.log(`Story Title: "${story.title}"`);
    console.log(`Story Bottom: "${story.bottom}"`);
    console.log('-------------------------------------------');

    const messages = [
      { role: 'system', content: `${DEEPSEEK_SYSTEM_PROMPT || ''}\n\n当前故事的汤面是：${story.title}。\n故事的汤底是：${story.bottom}` },
      { role: 'user', content: question }
    ];

    console.log('---------- DeepSeek API Request Payload ----------');
    console.log(JSON.stringify(messages, null, 2));
    console.log('------------------------------------------------');

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: DEEPSEEK_MODEL,
      messages: messages,
      stream: false, // For non-streaming response
      temperature: 0.1, // Keep responses consistent
      max_tokens: 50 // Only need a short answer
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiRawAnswer = response.data.choices[0].message.content.trim();
    console.log('---------- DeepSeek API Raw Response ----------');
    console.log(`Raw Answer: "${aiRawAnswer}"`);
    console.log('-----------------------------------------------');

    // 尝试标准化AI的回答
    let standardizedAnswer = '无关';
    let isFallback = false;
    if (aiRawAnswer.includes('是') || aiRawAnswer.toLowerCase().includes('yes')) {
      standardizedAnswer = '是';
    } else if (aiRawAnswer.includes('否') || aiRawAnswer.toLowerCase().includes('no')) {
      standardizedAnswer = '否';
    } else {
      isFallback = true; // If not '是' or '否', it's '无关' by default, mark as fallback
    }

    console.log('---------- Backend Processed Answer ----------');
    console.log(`Standardized Answer: "${standardizedAnswer}"`);
    console.log(`Is Fallback: ${isFallback}`);
    console.log('----------------------------------------------');

    res.json({ answer: standardizedAnswer, rawAnswer: aiRawAnswer, isFallback });

  } catch (error) {
    console.error(`Error in /api/chat:`, error); // Log full error for debugging

    if (axios.isAxiosError(error)) {
      // DeepSeek API specific error
      console.error('DeepSeek API error details:', error.response?.data || error.message);
      return res.status(error.response?.status || 500).json({
        error: 'AI service responded with an error.',
        details: error.response?.data || error.message,
      });
    } else {
      // Other unexpected errors
      return res.status(500).json({ error: 'An unexpected server error occurred.' });
    }
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`GET /           -> 服务信息`);
  console.log(`GET /api/test   -> 测试`);
  console.log(`POST /api/chat   -> AI 对话`);
});