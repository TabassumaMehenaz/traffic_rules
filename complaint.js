const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
    status: { type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending' },  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
