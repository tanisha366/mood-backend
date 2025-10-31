const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mood-dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.get('/api/moods', (req, res) => {
  const moods = [
    { id: 1, name: 'happy', emoji: '😊', color: '#FFD700' },
    { id: 2, name: 'sad', emoji: '😢', color: '#4682B4' },
    { id: 3, name: 'tired', emoji: '😴', color: '#696969' },
    { id: 4, name: 'motivated', emoji: '💪', color: '#32CD32' },
    { id: 5, name: 'calm', emoji: '😌', color: '#87CEEB' },
    { id: 6, name: 'angry', emoji: '😠', color: '#FF4500' },
    { id: 7, name: 'excited', emoji: '🎉', color: '#FF69B4' }
  ];
  res.json(moods);
});

// Get random quote by mood
app.get('/api/quotes/random', async (req, res) => {
  try {
    const { mood } = req.query;
    const Quote = require('./models/Quote');
    
    let query = {};
    if (mood && mood !== 'random') {
      query.mood = mood;
    }
    
    const count = await Quote.countDocuments(query);
    const random = Math.floor(Math.random() * count);
    const quote = await Quote.findOne(query).skip(random);
    
    if (!quote) {
      return res.status(404).json({ message: 'No quotes found' });
    }
    
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all quotes for a mood
app.get('/api/quotes', async (req, res) => {
  try {
    const { mood } = req.query;
    const Quote = require('./models/Quote');
    
    let query = {};
    if (mood) {
      query.mood = mood;
    }
    
    const quotes = await Quote.find(query);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new quote
app.post('/api/quotes', async (req, res) => {
  try {
    const Quote = require('./models/Quote');
    const quote = new Quote(req.body);
    await quote.save();
    res.status(201).json(quote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Seed initial data
app.post('/api/seed', async (req, res) => {
  try {
    const Quote = require('./models/Quote');
    await Quote.deleteMany({});
    
    const initialQuotes = [
      // Happy quotes
      { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", mood: "happy" },
      { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", mood: "happy" },
      { text: "Get busy living or get busy dying.", author: "Stephen King", mood: "happy" },
      
      // Sad quotes
      { text: "Tears come from the heart and not from the brain.", author: "Leonardo da Vinci", mood: "sad" },
      { text: "Every man has his secret sorrows which the world knows not.", author: "Henry Wadsworth Longfellow", mood: "sad" },
      
      // Tired quotes
      { text: "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.", author: "Ralph Marston", mood: "tired" },
      { text: "Sometimes the most productive thing you can do is relax.", author: "Mark Black", mood: "tired" },
      
      // Motivated quotes
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", mood: "motivated" },
      { text: "Don't let yesterday take up too much of today.", author: "Will Rogers", mood: "motivated" },
      
      // Calm quotes
      { text: "Peace is the result of retraining your mind to process life as it is, rather than as you think it should be.", author: "Wayne Dyer", mood: "calm" },
      { text: "Calm mind brings inner strength and self-confidence.", author: "Dalai Lama", mood: "calm" },
      
      // Angry quotes
      { text: "For every minute you remain angry, you give up sixty seconds of peace of mind.", author: "Ralph Waldo Emerson", mood: "angry" },
      { text: "Anger is an acid that can do more harm to the vessel in which it is stored than to anything on which it is poured.", author: "Mark Twain", mood: "angry" },
      
      // Excited quotes
      { text: "The biggest adventure you can take is to live the life of your dreams.", author: "Oprah Winfrey", mood: "excited" },
      { text: "Enthusiasm moves the world.", author: "Arthur Balfour", mood: "excited" }
    ];
    
    await Quote.insertMany(initialQuotes);
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
