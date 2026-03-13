const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const assignmentRoutes = require('./routes/assignment.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Assignment Portal API is running 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message });
});

module.exports = app;