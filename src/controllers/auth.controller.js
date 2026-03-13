const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prisma = require('../utils/prisma');
const generateToken = require('../utils/generateToken');

// here we will do the registration of users (both teachers and students)
const register = async (req, res) => {
  console.log('✅ Register route hit!');
  console.log('Body:', req.body);

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { name, email, password, role } = req.body;
  
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
  
      // Validate role
      if (!['TEACHER', 'STUDENT'].includes(role)) {
        return res.status(400).json({ message: 'Role must be TEACHER or STUDENT' });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });
  
      // Generate token
      const token = generateToken({ id: user.id, role: user.role });
  
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken({ id: user.id, role: user.role });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login };