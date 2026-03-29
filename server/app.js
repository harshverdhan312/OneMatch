const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const matchRoutes = require('./routes/match.routes');
const chatRoutes = require('./routes/chat.routes');
const checkInRoutes = require('./routes/checkin.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/checkin', checkInRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error Handler
app.use(errorHandler);

module.exports = app;
