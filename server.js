const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const assignmentRoutes = require('./src/routes/assignment.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'Assignment Portal API is running 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});