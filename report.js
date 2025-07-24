const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Moderate', 'High'], // Enforce specific values
    required: true
  },
  incidentDescription: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now // Automatically set the date when a report is created
  }
});

module.exports = mongoose.model('Report', reportSchema);