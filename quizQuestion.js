// backend/models/quizQuestion.js

const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String], // Array of strings for choices
    required: true,
  },
  correctAnswer: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

module.exports = QuizQuestion;