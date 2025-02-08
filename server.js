// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB (update the URI if using MongoDB Atlas)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adfriend';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define schemas and models
const analyticsSchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  feedback: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// Analytics endpoint: Save analytics data
app.post('/analytics', async (req, res) => {
  const { action, timestamp } = req.body;
  const analyticsEntry = new Analytics({ action, timestamp });
  try {
    await analyticsEntry.save();
    res.status(200).json({ message: 'Analytics saved successfully' });
  } catch (error) {
    console.error('Error saving analytics:', error);
    res.status(500).json({ error: 'Error saving analytics' });
  }
});

// Feedback endpoint: Save user feedback
app.post('/feedback', async (req, res) => {
  const { feedback, timestamp } = req.body;
  const feedbackEntry = new Feedback({ feedback, timestamp });
  try {
    await feedbackEntry.save();
    res.status(200).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ error: 'Error saving feedback' });
  }
});

// (Optional) Endpoint to view stored analytics (for debugging)
app.get('/analytics', async (req, res) => {
  try {
    const data = await Analytics.find().sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
});

// (Optional) Endpoint to view stored feedback (for debugging)
app.get('/feedback', async (req, res) => {
  try {
    const data = await Feedback.find().sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedback' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
