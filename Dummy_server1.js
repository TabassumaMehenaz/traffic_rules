const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'yourSecretKey'; // use a strong key

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/trafficDB')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// Models
const Complaint = require('./models/complaint');
const User = require('./models/user');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../frontend/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user; // { userId, role, email }
    next();
  });
}

// Middleware to check admin role
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
}

// POST: Submit complaint (user must be logged in)
app.post('/api/complaints', authenticateToken, async (req, res) => {
  const { phone, location, description } = req.body;
  const email = req.user.email;

  if (!email || !phone || !location || !description) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newComplaint = new Complaint({ email, phone, location, description, status: 'Pending' });
    await newComplaint.save();
    res.status(201).json({ message: 'Complaint submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error. Try again later.' });
  }
});

// GET: Generate reports from complaints
app.get('/api/reports', async (req, res) => {
  try {
    const complaints = await Complaint.find();

    const areaCounts = {};
    complaints.forEach(complaint => {
      const loc = complaint.location.trim();
      areaCounts[loc] = (areaCounts[loc] || 0) + 1;
    });

    const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);

    const reports = [];
    sortedAreas.forEach(([area, count], index) => {
      let severity = 'Low';
      if (index === 0) severity = 'High';
      else if (index <= 2) severity = 'Moderate';

      const incidents = complaints
        .filter(c => c.location.trim() === area)
        .map(c => ({
          incidentDescription: c.description,
          date: c.createdAt || c._id.getTimestamp(),
        }));

      incidents.forEach(i => {
        reports.push({
          area,
          severity,
          incidentDescription: i.incidentDescription,
          date: i.date,
        });
      });
    });

    res.status(200).json(reports);
  } catch (err) {
    console.error("Error generating reports:", err);
    res.status(500).json({ error: 'Failed to generate reports', details: err.message });
  }
});

// User: Get logged-in user's complaints
app.get('/api/user/complaints', authenticateToken, async (req, res) => {
  try {
    const complaints = await Complaint.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// POST: Signup
app.post('/api/signup', async (req, res) => {
  const {  email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({  email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: 'Signup successful!' });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed.' });
  }
});

// POST: Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Admin: View all complaints
app.get('/api/admin/complaints', authenticateToken, isAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Admin: Update complaint status
app.put('/api/admin/complaints/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedComplaint) return res.status(404).json({ error: 'Complaint not found' });

    res.json({ message: 'Status updated', complaint: updatedComplaint });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

// Profile Picture Upload
app.post('/api/upload-dp', upload.single('dp'), (req, res) => {
  if (req.file) {
    res.json({ message: 'Upload successful', filename: req.file.filename });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
