const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://ufs-backend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Make io accessible throughout the app
app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://ufs-backend.onrender.com',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with enhanced options
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'feedbackDB',
    retryWrites: true,
    w: 'majority'
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err.message));

// Routes
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Enhanced Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🟢 New connection: ${socket.id}`);

  // Join admin room if authenticated
  socket.on('join_admin_room', (token) => {
    // Verify token logic here
    socket.join('admin_room');
    console.log(`👨‍💻 Admin joined: ${socket.id}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Disconnected: ${socket.id}`);
  });

  socket.on('error', (err) => {
    console.error(`⚠️ Socket error (${socket.id}):`, err);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    websockets: io.engine.clientsCount
  });
});

// Start Server with enhanced error handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket available at ${process.env.CLIENT_URL || 'https://ufs-backend.onrender.com'}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('⚠️ Unhandled Rejection:', err);
});
